// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { callParseMethod } from "@/utils/parse";

export default async (req, res) => {
  const { method, ...other } = req.query;

  try {
    const _response = await callParseMethod(method, other);
    return res.status(200).json(_response);
  } catch (error) {
    return res.status(501).json({ status: "error", message: error.message });
  }
};
