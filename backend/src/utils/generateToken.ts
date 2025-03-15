import jwt from "jsonwebtoken";

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "30d",
  });
};

export default generateToken;
