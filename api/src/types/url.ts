export default class Url {

  public url: string;
  public numLikes: number;

  constructor(data) {
    this.url = data.url ;
    this.numLikes = data.numLikes ;
  }

}