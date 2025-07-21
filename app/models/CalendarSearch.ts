import { Instance, SnapshotIn, SnapshotOut, cast, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { CalendarItemEnum } from "./Shared"
import { BSON, Realm } from "realm"
import { SearchFilterModel } from "./SearchFilter"
import { SearchResultItem, SearchResultItemModel, SearchResultItemSnapshotIn } from "./SearchResultItem"
import { Attendance, CalenderNote, Project } from "./realm/calendar"

/**
 * Model description here for TypeScript hints.
 */
export const CalendarSearchModel = types
  .model("CalendarSearch")
  .props({
    query: types.optional(types.string, ""),
    typeFilter: types.optional(types.array(SearchFilterModel), []),
    projectFilter: types.optional(types.array(SearchFilterModel), []),
    result: types.optional(types.array(SearchResultItemModel), [])
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get typeFilterList() {
      return self.typeFilter.filter(i => i.value).map(i => i.id)
    },
    get projectFilterList() {
      return self.projectFilter.filter(i => i.value).map(i => new BSON.ObjectId(i.id))
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions(self => {
    let realmIns: Realm | undefined = undefined
    function clean() {
      self.projectFilter = cast([])
      self.typeFilter = cast([])
      self.query = ""
      self.result = cast([])
      realmIns?.objects(Project)
        .filtered("active == true").forEach(i => {
          self.projectFilter.push(cast({ id: i._id.toHexString(), name: i.name }))
        })
      Object.entries(CalendarItemEnum).forEach(([k, v]) => {
        self.typeFilter.push(cast({ id: k, name: v }))
      })
    }
    function toggle(group: "type" | "project", id: string) {
      if (group === "type") {
        self.typeFilter.find(i => i.id === id)?.toggle()
      }
      if (group === "project") {
        self.projectFilter.find(i => i.id === id)?.toggle()
      }
    }
    function setRealm(realm: Realm) {
      if (!realmIns)
        realmIns = realm
    }
    function search() {
      if (self.query === "") {
        self.result = cast([])
        return
      }
      const formatTitle = (item: Attendance | CalenderNote) => {
        if (item instanceof Attendance) {
          return `${item.worker.name}`
        }
        if (item instanceof CalenderNote) {
          return `${item.title}`
        }
        return ""
      }
      self.result = cast([])
      console.log(self.typeFilter)
      const res: SearchResultItemSnapshotIn[] = []
      if (self.typeFilter.find(i => i.id == CalendarItemEnum.attendance && i.value)) {
        realmIns?.objects(Attendance)
          .filtered("(worker.name CONTAINS $0 OR worker.skill CONTAINS $0 OR worker.proficiency CONTAINS $0 OR description CONTAINS $0) AND project._id IN $1", self.query, self.projectFilterList)
          .sorted("from", true)
          .forEach(i => res.push({
            id: i._id.toHexString(),
            title: formatTitle(i),
            description: i.description || "",
            timestamp: i.from,
            rightText: i.project.name,
            icon: "account-check"
          }))
      }
      if (self.typeFilter.find(i => i.id == CalendarItemEnum.note && i.value)) {
        realmIns?.objects(CalenderNote)
          .filtered("(title CONTAINS $0 OR text CONTAINS $0) AND project._id IN $1", self.query, self.projectFilterList)
          .sorted("at", true)
          .forEach(i => res.push({
            id: i._id.toHexString(),
            title: formatTitle(i),
            description: i.text,
            timestamp: i.at,
            rightText: i.project.name,
            icon: "note"
          }))
      }
      self.result = cast(res)
    }
    return {
      clean,
      toggle,
      search,
      setRealm,
    }
  }) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface CalendarSearch extends Instance<typeof CalendarSearchModel> { }
export interface CalendarSearchSnapshotOut extends SnapshotOut<typeof CalendarSearchModel> { }
export interface CalendarSearchSnapshotIn extends SnapshotIn<typeof CalendarSearchModel> { }
export const createCalendarSearchDefaultModel = () => types.optional(CalendarSearchModel, {})
