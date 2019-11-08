/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
// i18n library dependency, we use it below in a localisation interceptor
const i18n = require('i18next');
// i18n strings for all supported locales
const languageStrings = require('./languageStrings');

const {decks} = require('cards');

const colorIntents = ["RedIntent", "BlackIntent"];
const compareIntents = ["HigherIntent", "BelowIntent"];
const interExterIntents = ["InternIntent", "ExternIntent"];
const suiteIntents = ["DiamondsIntent", "ClubsIntent", "SpadesIntent", "HeartsIntent"];

const WELCOME_MESSAGE =  "Welcome in Red or Black! Please play moderatly to this game. How many player do you want";
const NB_PLAYER_ERROR_MESSAGE = "The number of players has already been set";
const NB_PLAYER_WRONG_ERROR_MESSAGE = "Please set a number of players between 1 and 13";
const NOT_ENOUGH_PLAYER_ERROR_MESSAGE = "I asked you to give me the name of the next player !";

const PHASE_ERROR_MESSAGE = [
    "I asked you, RED OR BLACK !",
    "I asked you, HIGHER or BELOW !",
    "I asked you, IN or OUT !",
    "I asked you, A SUITE !"
]

const ADD_PLAYER_ERROR_MESSAGE = "You cannot add another player in the game"

const cardValue = new Map([
    ["Ace", 1],
    ["Two", 2],
    ["Three", 3],
    ["Four", 4],
    ["Five", 5],
    ["Six", 6],
    ["Seven", 7],
    ["Eight", 8],
    ["Nine", 9],
    ["Ten", 10],
    ["Jack", 11],
    ["Queen", 12],
    ["King", 13]
  ]);

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = WELCOME_MESSAGE;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('HELP_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('GOODBYE_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('FALLBACK_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = handlerInput.t('REFLECTOR_MSG', {intentName: intentName});

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = handlerInput.t('ERROR_MSG');
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// This request interceptor will bind a translation function 't' to the handlerInput
const LocalisationRequestInterceptor = {
    process(handlerInput) {
        i18n.init({
            lng: Alexa.getLocale(handlerInput.requestEnvelope),
            resources: languageStrings
        }).then((t) => {
            handlerInput.t = (...args) => t(...args);
        });
    }
};
/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */


/* OUR WORK */
const SetNbPlayerIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SetNbPlayerIntent';
    },
    handle(handlerInput) {
        const nbPlayers = parseInt(handlerInput.requestEnvelope.request.intent.slots.number.value);
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let {verif, errorMessage} = verifIntent(sessionAttributes, Alexa.getIntentName(handlerInput.requestEnvelope), nbPlayers)
        if(!verif){
            return handlerInput.responseBuilder
                .speak(errorMessage)
                .reprompt()
                .getResponse();
        }

        const deck = new decks.StandardDeck();
        deck.shuffleAll();
        const sentence = "The game is launched with " + nbPlayers + " players, What\'s the name of the player one ?";
        sessionAttributes.numberOfPlayer = nbPlayers;
        sessionAttributes.playersList = [];
        sessionAttributes.currentPlayer = 1;
        sessionAttributes.deck = deck
        console.log("the deck:" + deck)
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        return handlerInput.responseBuilder
            .speak(sentence)
            .reprompt("What\'s the first player name ?")
            .getResponse();
    }
};

const SetNamePlayerIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SetNamePlayerIntent';
    },
    handle(handlerInput) {
        const  sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let {verif, errorMessage} = verifIntent(sessionAttributes, Alexa.getIntentName(handlerInput.requestEnvelope))
        if(!verif){
            return handlerInput.responseBuilder
                .speak(errorMessage)
                .reprompt()
                .getResponse();
        }

        const playerName = handlerInput.requestEnvelope.request.intent.slots.name.value;

        var sentence = "";
               

        sessionAttributes.playersList.push({key: sessionAttributes.currentPlayer, name: playerName, cards: []});
        sessionAttributes.currentPlayer = sessionAttributes.currentPlayer + 1;
        
        if (sessionAttributes.playersList.length >= sessionAttributes.numberOfPlayer) {
            sessionAttributes.currentPlayer = 0;
            sentence = "The player name is " + playerName +". " + sessionAttributes.playersList[sessionAttributes.currentPlayer].name + "! red or black?";
        } else {
            sentence = "The player name is " + playerName + ", What\'s the next player name ?";
        }
        
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        return handlerInput.responseBuilder
            .speak(sentence)
            .reprompt("What\'s the player name ?")
            .getResponse();

    }
};

const RedIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RedIntent';
    },
    handle(handlerInput) {
        const  sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let {verif, errorMessage} = verifIntent(sessionAttributes, Alexa.getIntentName(handlerInput.requestEnvelope))
        if(!verif){
            return handlerInput.responseBuilder
                .speak(errorMessage)
                .reprompt()
                .getResponse();
        }

        const cardDraw = sessionAttributes.deck.draw(1)[0]
        const suit = cardDraw.suit.name
        const rank = cardDraw.rank.longName
        console.log("salut à tous" + cardDraw)
        var sentence = "You draw a " + cardValue.get(rank) + " of " + suit;
        /*
        if (suit == "hearts" || suit == "diamonds"){
            sentence = sentence + ", you won !"
        } else {
            sentence = sentence + ", you lost !"
        }

        sessionAttributes.playersList[sessionAttributes.currentPlayer].cards.push(cardDraw)
        sessionAttributes.currentPlayer = sessionAttributes.currentPlayer + 1;
        if (sessionAttributes.currentPlayer == sessionAttributes.playersList.length){
            sessionAttributes.currentPlayer = 0
            sentence = sentence + sessionAttributes.playersList[sessionAttributes.currentPlayer].name + "! IN or OUT?";
        }*/
        
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        return handlerInput.responseBuilder
            .speak(sentence)
            .reprompt("What\'s the player name ?")
            .getResponse();

    }
};


/*
Be careful, you have to order 
*/

function verifIntent(session, intent, parameter = undefined) {
    const checkInPhase = () => {
        return (session.numberOfPlayer && session.playersList.length == session.numberOfPlayer)
    }

    if (colorIntents.includes(intent)){
        if (checkInPhase && session.playersList[session.currentPlayer].cards.length == 0){
            return {verif: true, error: ""}
        } else if (!session.numberOfPlayer){
            return {verif: false, errorMessage: NB_PLAYER_WRONG_ERROR_MESSAGE}
        } else if(session.numberOfPlayer && session.playersList.length < session.numberOfPlayer){
            return {verif: false, errorMessage: NOT_ENOUGH_PLAYER_ERROR_MESSAGE}
        } else {
            return {verif: false, errorMessage: PHASE_ERROR_MESSAGE}
        }
    } else if (compareIntents.includes(intent)) {
        return {verif: true, errorMessage: ""}
    } else if (interExterIntents.includes(intent)){
        return {verif: true, errorMessage: ""}
    } else if (suiteIntents.includes(intent)) {
        return {verif: true, errorMessage: ""}
    } else if (intent == "SetNbPlayerIntent"){
        if (session.numberOfPlayer){
            return {verif: false, errorMessage: NB_PLAYER_ERROR_MESSAGE + " to " + session.numberOfPlayer}
        } else if(parameter && parameter > 13){
            return {verif: false, errorMessage: NB_PLAYER_WRONG_ERROR_MESSAGE}
        } else {
            return {verif: true, errorMessage: ""}
        }
    } else if (intent == "SetNamePlayerIntent"){
        if (session.numberOfPlayer && session.playersList.length < session.numberOfPlayer) {
            return {verif: true, errorMessage: ""}
        } else if (!session.numberOfPlayer){
            return {verif: false, errorMessage: NB_PLAYER_WRONG_ERROR_MESSAGE}
        } else {
            return {verif: false, errorMessage: ADD_PLAYER_ERROR_MESSAGE}
        }
    } else {
        return {verif: true, errorMessage: ""}
    }
}

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        SetNbPlayerIntentHandler,
        SetNamePlayerIntentHandler,
        RedIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler)
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(LocalisationRequestInterceptor)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();
