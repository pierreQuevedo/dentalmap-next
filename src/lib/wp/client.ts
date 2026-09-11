import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { print } from 'graphql'

const endpoint = process.env.WP_GRAPHQL_URL!

export async function wp<TResult, TVariables extends Record<string, unknown>>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables?: TVariables,
): Promise<TResult> {
  const url = new URL(endpoint)
  url.searchParams.set('query', print(document))
  if (variables) url.searchParams.set('variables', JSON.stringify(variables))

  const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`WPGraphQL ${res.status} ${res.statusText}`)
  const json = (await res.json()) as { data?: TResult; errors?: { message: string }[] }
  if (json.errors?.length) throw new Error(`WPGraphQL: ${json.errors.map((e) => e.message).join(' | ')}`)
  return json.data as TResult
}
