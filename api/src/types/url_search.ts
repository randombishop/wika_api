import { ApiProperty } from '@nestjs/swagger';
import UrlMetadata from './url_metadata';

/**
 * Search results data object containing the search summary (time taken, number of hits and maximum match score)
 * plus the list of results as UrlMetadata instances
 */
export default class UrlSearch {
  @ApiProperty()
  public took: number;

  @ApiProperty()
  public numHits: number;

  @ApiProperty()
  public maxScore: number;

  @ApiProperty({ isArray: true, type: UrlMetadata })
  public hits: UrlMetadata[];

  /**
   * The constructor takes the object returned by Elastic Search API, fills in the fields
   * and transforms each hit into a UrlMetadata instance
   */
  constructor(data) {
    this.took = data.took;
    this.numHits = data.hits.total.value;
    if (this.numHits > 0) {
      this.maxScore = data.hits.max_score;
      this.hits = data.hits.hits.map((x) => new UrlMetadata(x));
    }
  }
}
