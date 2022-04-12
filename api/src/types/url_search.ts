import UrlMetadata from './url_metadata';

export default class UrlSearch {
  public took: number;
  public numHits: number;
  public maxScore: number;
  public hits: UrlMetadata[];

  constructor(data) {
    this.took = data.took;
    this.numHits = data.hits.total.value;
    if (this.numHits > 0) {
      this.maxScore = data.hits.max_score;
      this.hits = data.hits.hits.map((x) => new UrlMetadata(x));
    }
  }
}
