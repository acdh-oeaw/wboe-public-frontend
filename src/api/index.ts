declare var process: {
  env: {
    [key: string]: string
  }
}

const esEndpoint = 'https://https://walk-want-grew.acdh.oeaw.ac.at/_search'
const apiEndpoint = 'https://dboeannotation.acdh-dev.oeaw.ac.at/api'
const articleEndpoint = process.env.API_HOST || 'http://localhost:8081'

function parseXML(str: string) {
  return (new (window as any).DOMParser()).parseFromString(str, 'application/xml') as XMLDocument
}

export async function getDocumentsByCollection(id: number): Promise<XMLDocument[]> {
  const r = await (await fetch(apiEndpoint + '/documents/?in_collections=28')).json()
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

export async function getArticles(): Promise<Array<{ title: string, file_name: string }>> {
  const r = await (await fetch(articleEndpoint + '/articles')).json()
  return r
}

export async function getArticleByFileName(fileName: string): Promise<string> {
  const r = await (await fetch(articleEndpoint + '/static/article/' + fileName)).text()
  return r
}
