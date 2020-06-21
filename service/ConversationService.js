const moment = require("moment");

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

    if (context.conversation.complete || context.conversation.exit) {
      context.conversation.followUp = "Bye!";
      context.conversation = {};
      return context;
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
        context.conversation.followUp =
          "Hello there! I'll take your reservation order now";
        return context;
      }

      if (
        context.conversation.intent &&
        context.conversation.intent.name === "reservation" &&
        context.conversation.intent.confidence > 0.8
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
        const followUpBookConvo = [
          `Alright ${contact} a table has been booked for ${numberOfGuest} Guests`,
          `Thank You ${contact}, reservation successful`,
          `Your reservation for ${numberOfGuest} has been successfull`,
          `Thank you, your reservation is successful, BYE!`,
        ];
        context.conversation.followUp = context.conversation.followUp =
          followUpBookConvo[Math.floor(Math.random() * 4)];

        context.conversation.complete = true;
        return context;
      }
      const retry = [
        "Could you rephrase that please",
        "I didn't get that",
        "Please make a reservation by tellling me your name",
        "Please make a reservation by tellling me the number of guests you're expecting",
        "Please make a reservation by tellling me the the time for the reservation",
        "Please make a reservation",
      ];
      context.conversation.followUp = retry[Math.floor(Math.random() * 3)];
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
        reserveDateFollowUp[Math.floor(Math.random() * 3)];

      return context;
    }
    if (!entities.numberOfGuest) {
      const numberOfGuestsFollowUp = [
        "For how many persons?",
        "Table for how many?",
        "How many people are you expecting?",
      ];

      conversation.followUp =
        numberOfGuestsFollowUp[Math.floor(Math.random() * 3)];
      return context;
    }
    if (!entities.contact) {
      const contactFollowUp = [
        "Would you tell me your name please?",
        "Who I'm I making this reservation for please?",
        "What is your name?",
      ];

      conversation.followUp = contactFollowUp[Math.floor(Math.random() * 3)];
      return context;
    }

    conversation.complete = true;
    return context;
  }
}

module.exports = ConversationService;
