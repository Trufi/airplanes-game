import * as Joi from 'joi';
import { AnyClientMsg } from '../../client/messages';

const joinGame = Joi.object().keys({
  type: Joi.string()
    .valid('joinGame')
    .required(),
  token: Joi.string()
    .min(10)
    .max(1000)
    .required(),
});

const joinGameAsBot = Joi.object().keys({
  type: Joi.string()
    .valid('joinGameAsBot')
    .required(),
  name: Joi.string()
    .min(1)
    .max(30)
    .required(),
  userId: Joi.number()
    .required()
    .integer(),
});

const joinGameAsObserver = Joi.object().keys({
  type: Joi.string()
    .valid('joinGameAsObserver')
    .required(),
  token: Joi.string()
    .min(10)
    .max(1000)
    .required(),
});

const restart = Joi.object().keys({
  type: Joi.string()
    .valid('restart')
    .required(),
});

const ping = Joi.object().keys({
  type: Joi.string()
    .valid('ping')
    .required(),
  time: Joi.number()
    .required()
    .strict(),
});

const takeHealPoint = Joi.object().keys({
  type: Joi.string()
    .valid('takeHealPoint')
    .required(),
  id: Joi.number()
    .required()
    .strict()
    .integer()
    .positive(),
  time: Joi.number()
    .required()
    .strict(),
});

const integer = Joi.number()
  .required()
  .strict()
  .integer();

const float = Joi.number()
  .required()
  .strict();

const changes = Joi.object().keys({
  type: Joi.string()
    .valid('changes')
    .required(),
  time: integer,
  position: Joi.object().keys({
    x: integer,
    y: integer,
    z: integer,
  }),
  rotation: Joi.object().keys({
    x: float,
    y: float,
    z: float,
    w: float,
  }),
  lastShotTime: integer,
  hitBodyIds: Joi.array().items(
    Joi.number()
      .strict()
      .integer()
      .positive(),
  ),
});

const schemes: { [key: string]: Joi.ObjectSchema } = {
  joinGame,
  joinGameAsBot,
  joinGameAsObserver,
  changes,
  restart,
  ping,
  takeHealPoint,
};

const msgSchema = Joi.object()
  .keys({
    type: Joi.string().required(),
  })
  .unknown(true);

export const check = (msg: AnyClientMsg, id: number): boolean => {
  const anyMsgCheck = msgSchema.validate(msg);
  if (anyMsgCheck.error) {
    console.log(`Client (connectionId: ${id}) msg validation error: ${anyMsgCheck.error.message}`);
    return false;
  }

  const scheme = schemes[msg.type];
  if (!scheme) {
    console.log(`Scheme for message type "${msg.type}" not found, connectionId: ${id}`);
    return false;
  }

  const msgCheck = scheme.validate(msg);

  if (msgCheck.error) {
    console.log(`Client (connectionId: ${id}) msg validation error: ${msgCheck.error.message}`);
    return false;
  }

  return true;
};
