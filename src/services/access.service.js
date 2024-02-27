const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils/index");
const {
  BadRequestError,
  ConflictRequestError,
  AuthFailureError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const roleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};
class AccessService {

  static logout = async (keystore) => {
    const delKey = await KeyTokenService.removeKeyById(keystore._id);
    console.log({ delKey });
    return delKey;
  };
  static login = async ({ email, password, refreshToken = null }) => {
    //check email, check password,
    // create access token and refresh token
    //generate tokens
    //get data return from login
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError("Shop not found");
    }
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) {
      throw new AuthFailureError("Authentication failed");
    }
    const { _id: userId } = foundShop;
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");
    const tokens = await createTokenPair(
      { userId: userId, email },
      publicKey,
      privateKey
    );
    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
      userId,
    });
    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    // try {
    const holderShop = await shopModel.findOne({ email }).lean();

    if (holderShop) {
      throw new BadRequestError("Error: shop already exists");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [roleShop.SHOP],
    });
    if (newShop) {
      //create priveKey, publicKey (phuc tap)
      // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      //   privateKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      // });

      // (don gian)
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");
      console.log({ privateKey, publicKey }); //save collection keystore

      // const publicKeyString = await KeyTokenService.createKeyToken({
      //   userId: newShop._id,
      //   publicKey
      // });
      // const keyStore = await KeyTokenService.createKeyToken({
      //   userId: newShop._id,
      //   publicKey,
      //   privateKey,
      // });

      // if (!keyStore) {
      //   return { code: "xxx", message: "keyStore err" };
      // }

      // const publicKeyObject = crypto.createPublicKey(publicKeyString);

      //create token pair
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      );
      console.log(`Created toekn success:`, tokens);
      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    }
    return { code: 200, metadata: null };
    // } catch (error) {
    //   return {
    //     code: "xxx",
    //     message: error.message,
    //     stasus: "error",
    //   };
    // }
  };
}
module.exports = AccessService;
