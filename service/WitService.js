const { Wit } = require("node-wit");
const axios = require("axios");

class WitService {
  constructor(accessToken, axios) {
    this.client = new Wit({
      accessToken,
    });
  }

  async query(text) {
    try {
      const queryResult = await axios.get("https://api.wit.ai/message?", {
        headers: {
          Authorization: `Bearer ${process.env.WIT_ACCESS_TOKEN}`,
        },
        params: {
          q: text,
        },
      });

      // console.log(queryResult);
      const { entities, intents } = queryResult.data;

      const extratedEntities = {};

      Object.keys(entities).forEach(
        (key) =>
          (extratedEntities[entities[key][0].role] = entities[key][0].value)
      );
      return { extratedEntities, intents };
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = WitService;
