export default class UrlMetadata {
  public id: string;
  public url: string;
  public title: string;
  public description: string;
  public icon: string;
  public updatedAt: Date;
  public score: number;
  public numLikesUser: number;
  public numLikesTotal: number;

  constructor(data) {
    this.id = data._id;
    this.url = data._source.url;
    this.title = data._source.title;
    this.description = data._source.description;
    this.icon = data._source.icon;
    this.updatedAt = data._source.updatedAt;
    this.score = data._score;
  }
}
