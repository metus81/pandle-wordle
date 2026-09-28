import { NextResponse } from "next/server";

type WiktionaryDefinition = {
  definition?: string;
};

type WiktionaryEntry = {
  partOfSpeech?: string;
  definitions?: WiktionaryDefinition[];
};

type WiktionaryResponse = {
  en?: WiktionaryEntry[];
};

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getDefinitions(data: WiktionaryResponse) {
  return (
    data.en?.flatMap(
      (entry) =>
        entry.definitions
          ?.map((item) => ({
            partOfSpeech: entry.partOfSpeech,
            definition: item.definition ? stripHtml(item.definition) : null,
          }))
          .filter(
            (
              item,
            ): item is {
              partOfSpeech: string | undefined;
              definition: string;
            } => Boolean(item.definition),
          ) ?? [],
    ) ?? []
  );
}

function getBaseWord(data: WiktionaryResponse) {
  const html = data.en?.[0]?.definitions?.[0]?.definition;

  if (!html) return null;

  const match = html.match(/href="\/wiki\/([^"#]+)#English"/);

  return match?.[1] ?? null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ word: string }> },
) {
  const { word } = await params;
  const normalizedWord = word.trim().toLowerCase();

  if (!normalizedWord) {
    return NextResponse.json({ definition: null }, { status: 400 });
  }

  try {
    // First lookup
    const apiUrl = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(normalizedWord)}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return NextResponse.json(
        { definition: null },
        { status: response.status },
      );
    }

    const data: WiktionaryResponse = await response.json();

    let definitions = getDefinitions(data);

    // Check whether Wiktionary says this is a form of another word.
    const firstDefinitionHtml =
      data.en?.[0]?.definitions?.[0]?.definition ?? "";

    const isFormOf = firstDefinitionHtml.includes("form-of-definition");

    if (isFormOf) {
      const baseWord = getBaseWord(data);
      if (baseWord && baseWord !== normalizedWord) {
        const baseUrl = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(baseWord)}`;
        const baseResponse = await fetch(baseUrl);
        if (baseResponse.ok) {
          const baseData: WiktionaryResponse = await baseResponse.json();

          definitions = getDefinitions(baseData);
        }
      }
    }

    const definition = definitions[0]?.definition ?? null;
    return NextResponse.json({ definition });
  } catch (error) {
    return NextResponse.json({ definition: null }, { status: 500 });
  }
}
