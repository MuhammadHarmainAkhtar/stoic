import jwt from "jsonwebtoken";

export const identifier = (req: any, res: any, next: any) => {
  let token;
  if (req.headers.client === "not-browser") {
    token = req.headers.authorization;
  } else {
    token = req.cookies["Authorization"];
  }

  if (!token) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  try {
    const userToken = token.split(" ")[1];
    const jwtVerified = jwt.verify(
      userToken,
      process.env.JWT_SECRET || "secret"
    );
    if (jwtVerified) {
      req.user = jwtVerified;
      next();
    } else {
      throw new Error("Error in the token");
    }
  } catch (error) {
    console.log(error);
  }
};
