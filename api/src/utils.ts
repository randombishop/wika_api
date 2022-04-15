import UrlSearch from './types/url_search';
import { Neo4jService } from './neo4j.service';

/**
 * Util functions that don't fit into the Services classes
 * but are not worthy enough to have their own Service class :)
 */

/**
 * Loops over the UrlMetadata in a search result
 * and copies the data from the provided dictionary
 * into the specified field
 */
function fillFieldFromDictionary(
  urlSearch: UrlSearch,
  data: object,
  field: string,
) {
  for (let i = 0; i < urlSearch.hits.length; i++) {
    const hit = urlSearch.hits[i];
    hit[field] = data[hit.url] ? data[hit.url] : 0;
  }
}

/**
 * Adds the user number of likes and total number of likes
 * into Url search results
 * using neo4j connection
 */
async function addNumLikesToSearchResults(
  urlSearch: UrlSearch,
  user: string,
  neo4j: Neo4jService,
) {
  const urls = urlSearch.hits.map((x) => {
    return x.url;
  });
  const userLikes = await neo4j.getUserNumLikes(urls, user);
  fillFieldFromDictionary(urlSearch, userLikes, 'numLikesUser');
  const totalLikes = await neo4j.getTotalNumLikes(urls);
  fillFieldFromDictionary(urlSearch, totalLikes, 'numLikesTotal');
}

export { fillFieldFromDictionary, addNumLikesToSearchResults };
