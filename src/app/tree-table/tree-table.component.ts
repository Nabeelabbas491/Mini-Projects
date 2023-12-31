import { Component } from '@angular/core';
import { Util } from './util';

@Component({
  selector: 'app-tree-table',
  templateUrl: './tree-table.component.html',
  styleUrls: ['./tree-table.component.css']
})
export class TreeTableComponent {

  data: TreeData[] = structuredClone(Util.Data);
  tableDataDeepCopy: Array<TreeData> = [];
  allExpandedNodeList: Array<TreeData> = []
  currentExpandedRow = Object.assign({});
  ascendingOrder: boolean = false;
  breadCrumbs:Array<any | null> = []
  config = {
    collapseAllOnExpand : true,    // callapse all other expanded rows when expnading a new row
    collapseChildNodeOnExpand : false ,
    paddinggLeft : 20
  }

  constructor() {}

  ngOnInit(): void {
    this.data = this.data.map((m:TreeData) => { return { ...m, expanded: false, level: 1, class: m.data.uuid } })
    this.tableDataDeepCopy = structuredClone(this.data)
  }

  search(input: string) {
    const temp = structuredClone(this.tableDataDeepCopy.map((m) => { return { ...m, expanded: false } }))
    if (input.length) {
      this.data = temp.filter(m => m.data.title.toLowerCase().includes(input.toLowerCase()))
    } else {
      this.data = temp
    }
  }

  recursive(item: TreeData, idx : number) {
    item.expanded = true
    this.allExpandedNodeList.push(item)
    if (item.children && item.children.length) {
      item.children.forEach((m, i) => {
        m.level = item.level + 1;
        m.paddingLeft = `${(m.level * this.config.paddinggLeft) - this.config.paddinggLeft}px`
        m.class = `${item.class}__${m.data.uuid}`
        m.children ? this.recursive(m, i) : this.allExpandedNodeList.push(m)
      })
    }
  }

  expandAll(): void {
    this.allExpandedNodeList = []
    const temp = structuredClone(this.tableDataDeepCopy)
    temp.forEach((item, idx) => {
      this.recursive(item, idx)
    })
    this.data = structuredClone(this.allExpandedNodeList)
    // this.getTotalCount()
  }

  
  collapseAll(): void {
    this.data = structuredClone(this.tableDataDeepCopy.map((m) => { return { ...m, expanded: false } }))
    this.breadCrumbs = []
  }

  expandRow(item:TreeData, idx : number): void {

    // for callapsing the pervious expanded row
    if (Object.keys(this.currentExpandedRow).length && item.level == 1 && this.config.collapseAllOnExpand) {
      this.collapseRow(this.currentExpandedRow.data, this.currentExpandedRow.index)
      idx = this.data.findIndex((m:TreeData) => m.data.uuid == item.data.uuid)
      item = this.data[idx]
    }

    item.expanded = true
    item.children?.forEach((m, i) => {
      m.expanded = false;
      m.level = item.level + 1;
      m.topParentId = this.data.find(m => m['expanded'] && m['level'] == 1)?.data.uuid
      m.paddingLeft = `${(m.level * this.config.paddinggLeft) - this.config.paddinggLeft}px`
      m.class = `${item.class}__${m.data.uuid}`
      this.data.splice(idx + 1 + i, 0, m)
    })

   if(this.config.collapseAllOnExpand){
    if (item.level == 1) {
      this.currentExpandedRow.index = idx
      this.currentExpandedRow.data = item
    }

   

    if (item.level == 1) {
      let firstObj = { count: this.getCount(item), level:item.level}
      this.breadCrumbs = [null, firstObj]
    } else {
      this.breadCrumbs[item.level] = { count: this.getCount(item), level:item.level }
    }
   }
  }

  getCount(item:TreeData){
    let array = this.data.filter((m: TreeData) => (m.topParentId == item.topParentId && m.level == item.level))
    let count = 0
    array.forEach((m: any) => { if (m.expanded) count = count + m.children.length })
    return count
  }

  // getCount(item, idx) {
  //   let list = []
  //   for (let i = 0; i < this.data.length; i++) {
  //     if (i == idx) {
  //       continue;
  //     } else if (this.data[i]['class'].includes(item.class)) {
  //       // console.log("class", this.data[i]['class'])
  //       list.push(i)
  //     }
  //   }
  //   return list.length
  // }

  collapseRow(item:TreeData, idx : number): void {
    item.expanded = false
    const uuid = item.data.uuid
    let indexesToBeRemoved : any = []

    for (let i = 0; i < this.data.length; i++) {
      if (i == idx) {
        continue;
      } else if (this.data[i]['class'].includes(uuid)) {
        indexesToBeRemoved.push(i)
      }
    }

    this.data = this.data.filter((m, i) => !indexesToBeRemoved.includes(i))

   if(this.config.collapseAllOnExpand){

    if (item.level == 1) {
      this.breadCrumbs = []
    } else {
      this.getCount(item) == 0 ? this.breadCrumbs.splice(item.level, this.breadCrumbs.length - item.level) 
      : this.breadCrumbs[item.level] = { count: this.getCount(item), level: item.level }
    }
   }
  }

  sort(): void {
    const temp = structuredClone(this.tableDataDeepCopy)
    this.ascendingOrder = !this.ascendingOrder
    this.data = this.ascendingOrder ? temp.sort((a, b) => a.data.title.localeCompare(b.data.title)) : temp.sort((a, b) => b.data.title.localeCompare(a.data.title))
  }

}

export interface TreeData {
  data: TableRow
  expanded:boolean
  level : number 
  topParentId: string | unknown
  paddingLeft : string
  class: string
  children: Array<TreeData> | null 
}

export interface TableRow {
  uuid: string,
  title: string,
  parent: string | null,
  total_risk_score: number,
  total_readiness_score: number,
  total_purchase_price: number,
  total_res_adj_impact: number,
  total_physical_impact: number,
  total_vulnerability_score: number,
  avg_risk_score: number,
  avg_readiness_score: number,
  avg_res_adj_impact: number,
  avg_physical_impact: number,
  avg_vulnerability_score: number,
  avg_value_at_risk: number,
  avg_market_value: number,
  tier_4 : string,
  scenario : string
}
