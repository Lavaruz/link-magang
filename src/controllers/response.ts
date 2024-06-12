import { Response } from "express";

const response = (
  statusCode: number,
  message: string,
  datas: object,
  res: Response
) => {
  res.status(statusCode).json({
    status_code: statusCode,
    message: message,
    datas: datas || [],
  });
};

export default response;
