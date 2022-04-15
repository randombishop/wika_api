import { ApiProperty } from '@nestjs/swagger';

/**
 * Url data object containing the url string and number of likes
 */
export default class Url {
  @ApiProperty()
  public url: string;

  @ApiProperty()
  public numLikes: number;

  constructor(data) {
    this.url = data.url;
    this.numLikes = data.numLikes;
  }
}
