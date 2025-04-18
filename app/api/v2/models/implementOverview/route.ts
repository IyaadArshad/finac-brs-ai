import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  let params;
  try {
    params = await request.json();
    if (!params.overview || !params.file_contents) {
      return Response.json({
        code: 400,
        message: "overview and file_contents are required",
      });
    }
  } catch (error) {
    return Response.json({ code: 400, message: "Invalid JSON payload" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ code: 500, message: "Missing OpenAI API key" });
  }

  const overview = params.overview;
  const file_name = params.file_name;

  console.log("PARAM OVERVIEW", overview);
  console.log("PARAM FILE CONTENTS", params.file_contents);

  const Sysprompt = `
  
  You are a BRS document editor. 
  You receive change requests and the current document content. 
  You must implement only the requested changes while preserving all existing content unless explicitly asked to modify it. 
  Each screen must maintain the format: 
  H2 heading (numbered), 
  optional description, diagram section, 
  and extra data section.  

  you should be expected to think beyond what you were asked to do. For example, if you are asked to create a one screen library management system only tracking books using crud for storage, you needs to think deeply and step by step. Think about every possible function, module down the the very bottom on what the screen/function might be expected to do. Make sure in the brs document you have broken it down as much as possible. For the example, you should create a screen and have individual modules for each function of the screen, creating book entry, updating book details, deleting books, reading books details, each module should contain the inputs, how its meant to be processed the outputs, you should leave no room for assumption for the developer reading the brs, it should be extremely specific and assume details it doesn't know. in the module example, it should explain how the module processes user input and how it displays output, plans for the ui, for example in the read books module it suggests a plan "
1. The user would be required to input the name of the book they are querying
2. The system uses CRUD operation read to fetch attributes IBAN, Name, and Blurb of the book
4. The system should validate the input to ensure the book name exists in the database.
5. If the book name is found, the system retrieves the book details including IBAN, Name, Blurb, and Tags.
6. The retrieved details are displayed in a user-friendly format on the UI.
7. If the book name is not found, the system should display an appropriate error message to the user.
8. The UI should provide an option to go back to the main menu or perform another search.
". Remember that previously the user is used to spending 4 weeks detailing everything specifically and working on it. You should not just create a document with simply what they put. It needs to be extremely specific, detailed and follow requirements. Make sure to include sample data in a table. All tables must have at least 7 rows. You should never have a BRS that feels empty or looks empty or spaced out. it is not meant to be minimalist, it is meant to be detailed to the core.

For your reference, this is the current document content:
"${params.file_contents}"

Please update the document following these requirements:
1. Keep the existing document structure
2. Only make changes specified in the overview
3. Maintain all existing content unless explicitly asked to change/remove it
4. Return the complete updated document

Extra Important things to follow:
5. Do not prefix any part of the BRS with a heading (Example: DO NOT PUT DESCRIPTION OR TITLE BEFORE THE TEXT)
6. Diagrams are code blocks containing JSON "{"brsDiagram": {}" Do not modify this blank diagram template. `;

  const prompt = `
Hello, please make these changes:
${overview}

If you recieve something that looks like a BRS file itself as user inputs, improve the document and modify it as appropriate
`;
  try {
    const response = await openai.chat.completions.create({
      model: "o3-mini",
      reasoning_effort: "high",
      messages: [
        {
          role: "system",
          content: [
            {
              text: Sysprompt,
              type: "text",
            },
          ],
        },
        {
          role: "user",
          content: [{ type: "text", text: prompt }],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "version_response",
          schema: {
            type: "object",
            required: ["newVersion"],
            properties: {
              newVersion: {
                type: "string",
                description:
                  "Updated version of the document with changes the user requested implemented",
              },
            },
            additionalProperties: false,
          },
          strict: true,
        },
      },
      max_completion_tokens: 10000,
    });

    const OpenAIResponse = response.choices[0].message.content;
    if (OpenAIResponse === null) {
      throw new Error("OpenAIResponse is null");
    }

    console.log("Raw OpenAI response content:", OpenAIResponse);

    let NewVersion;
    try {
      const parsedData = JSON.parse(OpenAIResponse);
      NewVersion = parsedData.newVersion;

      if (!NewVersion) {
        throw new Error("newVersion field is empty or missing");
      }

      console.log("Parsed newVersion length:", NewVersion.length);
      console.log(
        "First 100 chars of newVersion:",
        NewVersion.substring(0, 100)
      );
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      if (parseError instanceof Error) {
        throw new Error(
          `Failed to parse OpenAI response: ${parseError.message}`
        );
      } else {
        throw new Error("Failed to parse OpenAI response: Unknown error");
      }
    }

    console.log("Attempting to publish new version for file:", file_name);

    const publishData = { file_name, data: NewVersion };
    console.log(
      "Publishing data structure:",
      JSON.stringify({
        file_name,
        dataLength: NewVersion.length,
      })
    );

    const publishNewVersion = await fetch(
      "https://finac-brs-agent.acroford.com/api/legacy/data/publishNewVersion",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(publishData),
      }
    );

    if (!publishNewVersion.ok) {
      const errorText = await publishNewVersion.text();
      console.error(`Failed to publish new version: ${errorText}`);
      throw new Error(
        `Publish API returned status ${publishNewVersion.status}: ${errorText}`
      );
    }

    const publishNewVersionResponse = await publishNewVersion.json();

    const latestVersion = publishNewVersionResponse.latestVersion;

    return Response.json({
      code: 200,
      message: "Successfully updated the document",
      latestVersion,
    });
  } catch (error) {
    console.error("Error in implementOverview:", error);
    return Response.json({
      code: 500,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}