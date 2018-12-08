import axios from 'axios'

declare var process: {
  env: {
    [key: string]: string
  }
}

const esEndpoint = 'https://walk-want-grew.acdh.oeaw.ac.at/_search'
const apiEndpoint = 'https://dboeannotation.acdh-dev.oeaw.ac.at/api'
const txtEndpoint = 'https://vawadioe.acdh.oeaw.ac.at/lioetxt/'
const localEndpoint = process.env.API_HOST || 'http://localhost:8081'
const articleEndpoint = localEndpoint + '/api/article'

function parseXML(str: string) {
  return (new (window as any).DOMParser()).parseFromString(str, 'application/xml') as XMLDocument
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

export async function getDocuments(page = 1, items = 100): Promise<any[]> {
  const r = await (await fetch(apiEndpoint + '/documents/?page=' + page + '&page_size=' + items)).json()
  const ds = (await axios({
    method: 'POST',
    data: {
      from: (page - 1) * items,
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
  console.log(ds.hits.hits)
  return ds.hits.hits
}

export async function getDocumentsByCollection(id: number): Promise<XMLDocument[]> {
  const r = await (await fetch(apiEndpoint + '/documents/?in_collections=28')).json()
  console.log(r)
  const ds = await (await fetch(esEndpoint, {
    body: JSON.stringify({
      query: {
        ids: {
          type : '_doc',
          values: r.results.map((result: any) => result.es_id)
        }
      }
    })
  })).json()
  return ds.hits.hits
}

export async function getArticles(search = 'f'): Promise<Array<{ title: string, filename: string }>> {
  // tslint:disable-next-line:max-line-length
  const r = await (await fetch(articleEndpoint + '?initial=' + search)).json()
  return r.results.article
}

export async function getArticleByFileName(fileName: string): Promise<string> {
  const r = await (await fetch(articleEndpoint + '/' + fileName)).text()
  return r
}
