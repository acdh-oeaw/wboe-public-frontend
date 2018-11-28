
// import api from '../api'
import * as geojson from 'geojson'
import * as _ from 'lodash'

export class Store {
  public _gemeinden = geoStore.gemeinden
  get gemeinden() {
    return this._gemeinden
  }
}

export const geoStore = {
  gemeinden: null as geojson.FeatureCollection|null,
  grossregionen: null as geojson.FeatureCollection|null,
  bundeslaender: null as geojson.FeatureCollection|null
}

async function init() {
  geoStore.gemeinden = await (await fetch('/static/test_geo.json')).json() as geojson.FeatureCollection
}

export const methods = {
  test() {
    console.log('hello')
  }
}

export const initialize = _.once(init)
