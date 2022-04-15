import { ApiProperty } from '@nestjs/swagger';

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
