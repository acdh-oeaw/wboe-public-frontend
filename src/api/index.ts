import axios from 'axios'
import * as _ from 'lodash'
import { userStore } from '../store/user'

declare var process: {
  env: {
    [key: string]: string
  }
}

interface Documents {
  total: number
  documents: Array<{
    Bedeutung: string
    Fragebogennummer: string
    Hauptlemma: string
    Kontext: string
    Lautung: string
    Nebenlemma: string
    Wortart: string
    entry: any
    id: string
    ortsSigle: string
  }>
}

const apiEndpoint = 'https://dboeannotation.acdh-dev.oeaw.ac.at/api'
const txtEndpoint = 'https://vawadioe.acdh.oeaw.ac.at/lioetxt/'
const localEndpoint = process.env.API_HOST || 'http://localhost:8081'
const articleEndpoint = localEndpoint + '/api/article'

const localUrls: {[remoteUrl: string]: string} = {
  '/lioetxt/home/': '/',
  '/lioetxt/wboe-artikel/': '/articles',
  '/lioetxt/karten/': '/maps',
  '/lioetxt/materialien/': '/resources',
  '/lioetxt/belegdatenbank/': '/db'
}

export async function getWebsiteHtml(path: string): Promise<string> {
  path = txtEndpoint === path.substr(0, txtEndpoint.length) ? path.substr(txtEndpoint.length) : path
  if (path.substr(path.length - 1) !== '/' ) {
    path += '/'
  }
  return (await fetch(txtEndpoint + path)).text()
}

export function isExternUrl(url: string): boolean {
  return txtEndpoint !== url.substr(0, txtEndpoint.length)
}

export function isLocalUrl(url: string): string|null {
  let rUrl = null
  Object.keys(localUrls).forEach((aUrl: any) => {
    if (url.substr(url.length - aUrl.length) === aUrl) {
      rUrl = localUrls[aUrl]
    }
  });
  return rUrl
}

export async function getDocumentTotalCount(): Promise<number> {
  const r = await (await axios({
    method: 'GET',
    url: apiEndpoint + '/documents/?page=1&page_size=1'
  })).data
  return r.count
}

export async function getDocuments(page = 1, items = 100): Promise<Documents> {
  const r = await (await fetch(apiEndpoint + '/documents/?page=' + page + '&page_size=' + items)).json()
  const ds = (await axios({
    method: 'POST',
    data: {
      size: items,
      query: {
        ids: {
          type: '_doc',
          values: r.results.map((result: any) => result.es_id)
        }
      }
    },
    url: localEndpoint + '/es-query'
  })).data
  // console.log(ds.hits.hits)
  return {
    documents: ds.hits.hits.map((h: any) => {
      return {
        ...h._source,
        id: h._id,
        ortsSigle: sigleFromEsRef(h._source.entry.ref)
      }
    }),
    total: ds.hits.total
  }
}

function sigleFromEsRef(ref: Array<{$: string, '@type': string}>): string|null {
  if (Array.isArray(ref)) {
    const q = ref.find(r => r['@type'] === 'quelleBearbeitet')
    if (q) {
      const m = q.$.match(/\{(.*)\}/)
      return m !== null
        ? m[0].replace('{', '').replace('}', '')
        : null
    } else {
      return null
    }
  } else {
    return null
  }
}

// tslint:disable-next-line:max-line-length
export async function searchCollections(val: string): Promise<Array<{ name: string, value: string, description: string }>> {
  const res = await (await fetch(apiEndpoint + '/collections/?page=1&page_size=10&title=' + val)).json()
  return res.results.map((r: any) => {
    return {
      name: r.title,
      value: _.last(r.url.match(/(\d+)/)),
      description: r.description
    }
  })
}
// tslint:disable-next-line:max-line-length
export async function getCollectionByIds(ids: string[]): Promise<Array<{ name: string, value: string, description: string }>> {
  const ress = await Promise.all(ids.map(async (id) => (await fetch(apiEndpoint + '/collections/' + id)).json()))
  return ress.map((r: any) => ({
    name: r.title,
    value: _.last(r.url.match(/(\d+)/)) as string,
    description: r.description
  }))
}

export async function searchDocuments(
  search: string, page = 1, items = 100, descending = false, sortBy = null
): Promise<Documents> {
  const sort = sortBy !== null && {
    sort: [
      {
        [ sortBy! ]: { order: descending ? 'desc' : 'asc' }
      }
    ]
  }
  const ds = (await axios(localEndpoint + '/es-query', {
    method: 'POST',
    data: {
      ...sort,
      from: (page - 1) * items,
      size: items,
      query: {
        multi_match: {
          fields: [
            'Hauptlemma',
            'Bedeutung',
            'Fragebogennummer',
            'Kontext',
            'Lautung',
            'Nebenlemma',
            'Wortart'
          ],
          query: search,
          type: 'phrase_prefix'
        }
      }
    }
  })).data
  return {
    documents: ds.hits.hits.map((h: any) => {
      return {
        ...h._source,
        id: h._id,
        ortsSigle: sigleFromEsRef(h._source.entry.ref)
      }
    }),
    total: ds.hits.total
  }
}

export async function getDocumentsByCollection(ids: string[], page = 1, items = 100): Promise<Documents> {
  const r = await (await fetch(apiEndpoint + `/documents/?${
    ids.map(id => 'in_collections=' + id).join('&')
  }&page_size=${ items }&page=${ page }`)).json()
  const ds = await (await axios({
    url: localEndpoint + '/es-query',
    method: 'POST',
    data: {
      from: 0,
      size: items,
      query: {
        ids: {
          type : '_doc',
          values: r.results.map((result: any) => result.es_id)
        }
      }
    }
  })).data
  return {
    documents: ds.hits.hits.map((h: any) => {
      return {
        ...h._source,
        id: h._id,
        ortsSigle: sigleFromEsRef(h._source.entry.ref)
      }
    }),
    total: r.count
  }
}

export async function getArticles(search?: string): Promise<Array<{ title: string, filename: string }>> {
  // tslint:disable-next-line:max-line-length
  if (search !== undefined) {
    const r = await (await fetch(articleEndpoint + '?initial=' + search + '&status=' + userStore.articleStatus)).json()
    return r.results.article.length ? r.results.article : [ r.results.article ]
  } else {
    const r = await (await fetch(articleEndpoint + '?status=' + userStore.articleStatus)).json()
    return r.results.article.length ? r.results.article : [ r.results.article ]
  }
}

export async function getArticleByFileName(fileName: string): Promise<string> {
  const r = await (await fetch(articleEndpoint + '/' + fileName)).text()
  return r
}
