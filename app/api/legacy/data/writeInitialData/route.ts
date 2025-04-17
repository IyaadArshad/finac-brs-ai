import PocketBase from "pocketbase";

const pb = new PocketBase(`${process.env.POCKETBASE_SERVER_URL}`);

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
    if (!body.file_name || !body.data) {
      return Response.json({ code: 400, message: "file_name and data are required" });
    }
  } catch (error) {
    return Response.json({ code: 400, message: "Invalid JSON payload" });
  }

  const file_name = body.file_name;
  const data = body.data;

  interface FetchIdResponse {
    id: string;
  }

  async function FetchId(file_name: string): Promise<Response> {
    try {
      const record: FetchIdResponse = await pb
        .collection("files")
        .getFirstListItem(`file_name='${file_name}'`, { fields: "id" });
      return Response.json({ code: 200, message: "success", id: record.id });
    } catch (error) {
      return Response.json({ code: 404, message: "notfound" });
    }
  }

  const fetchIdResponse = await FetchId(file_name);
  const fetchIdData = await fetchIdResponse.json();

  if (fetchIdData.code === 404) {
    return Response.json({
      success: false,
      message: "File not found"
    })
  }

  const id = fetchIdData.id;
  
  const existingRecord = await pb.collection("files").getOne(id);
  const recordData = existingRecord.data || {};

  if (recordData.latestVersion && recordData.latestVersion > 0) {
    return Response.json({
      success: "false",
      message: `**${file_name}** is already initialized, please use implement_edits to create a new version`,
      systemMessage: `File already has some versions. Use implement_edits instead.`,
      file_name,
    });
  }

  recordData.latestVersion = 1;
  recordData.versions = { 1: data };

  await pb.collection("files").update(id, {
    file_name,
    data: recordData,
  });

  return Response.json({
    success: "true",
    message: `**${file_name}** has been successfully initialized`,
    systemMessage: `The first version is now v1. Use implement_edits to publish subsequent versions.`,
    file_name,
  });
}