class ConversationService {
  static async run(witService, text, context) {
    if (!context.conversation) {
      context.conversation = {
        intent: {},
        entities: {},
        followUp: "",
        complete: false,
        exit: false,
      };
    }

    if (!text) {
      context.conversation.followUp = "Hello there!";
      return context;
    }
    try {
      const { extratedEntities, intents } = await witService.query(text);
      console.log(intents);
      if (!intents && !context.conversation.complete) {
        context.conversation.followUp = "Could you please rephrase?";
      }
      context.conversation.intent = intents[0];
      context.conversation.entities = {
        ...context.conversation.entities,
        ...extratedEntities,
      };

      if (
        context.conversation.intent &&
        context.conversation.intent.name === "farewell"
      ) {
        context.conversation.followUp = "ok, good bye";
        context.conversation.exit = true;
        return context;
      }

      if (
        context.conversation.intent &&
        context.conversation.intent.name === "greeting"
      ) {
        context.conversation.followUp = "Hello there!";
        return context;
      }

      if (
        context.conversation.intent &&
        context.conversation.intent.name === "reservation"
      ) {
        return ConversationService.intentReservation(context);
      }

      // Check if the we have all the necessary details to book a reservation
      if (
        context.conversation.entities.reserveDate &&
        context.conversation.entities.contact &&
        context.conversation.entities.numberOfGuest
      ) {
        const {
          contact,
          numberOfGuest,
          reserveDate,
        } = context.conversation.entities;
        context.conversation.followUp = context.conversation.followUp = `Alright ${contact} a table has been booked for ${numberOfGuest} for ${reserveDate}`;

        context.conversation.complete = true;
        return context;
      }
      context.conversation.followUp = "Could you rephrase that please?";
      return context;
    } catch (err) {
      console.log(err);
    }
  }

  static intentReservation(context) {
    const { conversation } = context;
    const { entities } = conversation;
    if (!entities.reserveDate) {
      const reserveDateFollowUp = [
        "For when would you like to make the reservation?",
        "When would this reservation be for?",
        "Time for this reservation?",
      ];
      conversation.followUp =
        reserveDateFollowUp[Math.floor(Math.random()) * 2];

      return context;
    }
    if (!entities.numberOfGuest) {
      const numberOfGuestsFollowUp = [
        "For how many persons?",
        "Table for how many?",
        "How many people are you expecting?",
      ];

      conversation.followUp = "For how many persons?";
      return context;
    }
    if (!entities.contact) {
      const contactFollowUp = [
        "Would you tell me your name please?",
        "Who I'm I making this reservation for please?",
        "What is your name?",
      ];

      conversation.followUp = "Would you tell me your name please?";
      return context;
    }

    conversation.complete = true;
    return context;
  }
}

module.exports = ConversationService;
