import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { Neo4jService } from './neo4j.service';


const TEST_USER = 'aaaaaaaaaaaaaaa';


describe('AppController', () => {

  let appController: AppController;
  let neo4jService: Neo4jService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [Neo4jService],
    }).compile();

    appController = app.get<AppController>(AppController);
    neo4jService = app.get<Neo4jService>(Neo4jService);
  });

  describe('ping', () => {
    it('should return "pong"', () => {
      expect(appController.ping()).toBe('pong');
    });
  });

  describe('listUrlsByLiker', () => {
    it('should return urls liked by a user', async () => {
      const urls = await appController.listUrlsByLiker({user:TEST_USER});
      expect(urls.length).toBe(2);
    });
  });

  describe("dispose", function () {
    it("should close the Neo4j driver", async function () {
      await neo4jService.dispose();
    });
  });

});
