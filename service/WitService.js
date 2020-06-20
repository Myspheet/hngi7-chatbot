const { Wit } = require("node-wit");

class WitService {
  constructor(accessToken) {
    this.client = new Wit({
      accessToken,
    });
  }

  async query(text) {
    const queryResult = await this.client.message(text);

    const { entities } = queryResult;

    const extratedEntities = {};

    Object.keys(entities).forEach(
      (key) => (extratedEntities[key] = entities[key][0].value)
    );
    return extratedEntities;
  }
}

module.exports = WitService;
