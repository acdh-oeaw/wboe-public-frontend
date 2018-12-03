// tslint:disable:max-line-length
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
  geoStore.gemeinden = await (await fetch('/static/gemeinden-geojson-optimized.json')).json() as geojson.FeatureCollection
  geoStore.bundeslaender = await (await fetch('/static/bundeslaender-geojson-optimized.json')).json() as geojson.FeatureCollection
  geoStore.grossregionen = await (await fetch('/static/grossregionen-geojson-optimized.json')).json() as geojson.FeatureCollection
}

export const methods = {
  test() {
    console.log('hello')
  }
}

export const initialize = _.once(init)
