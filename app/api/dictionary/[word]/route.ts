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

function cleanText(html: string) {
  return (
    html
      // Remove styles/scripts before stripping HTML.
      .replace(/<(style|script)[^>]*>[\s\S]*?<\/\1>/gi, "")
      // Remove leaked CSS rules.
      .replace(/[^{}]+\{[^}]*\}/g, "")
      // Strip HTML.
      .replace(/<[^>]+>/g, " ")
      // Normalize whitespace.
      .replace(/\s+/g, " ")
      .trim()
  );
}

function getDefinitions(data: WiktionaryResponse) {
  return (
    data.en?.flatMap((entry) =>
      (entry.definitions ?? [])
        .map(({ definition }) => ({
          partOfSpeech: entry.partOfSpeech,
          definition: definition ? cleanText(definition) : "",
        }))
        .filter((item) => item.definition),
    ) ?? []
  );
}

function getBaseWord(data: WiktionaryResponse) {
  const definition = data.en?.[0]?.definitions?.[0]?.definition ?? "";

  return definition.match(/href="\/wiki\/([^"#]+)#English"/)?.[1] ?? null;
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
    const getWord = async (word: string) => {
      const url =
        `https://en.wiktionary.org/api/rest_v1/page/definition/` +
        encodeURIComponent(word);

      const response = await fetch(url);

      if (!response.ok) return null;

      return (await response.json()) as WiktionaryResponse;
    };

    const data = await getWord(normalizedWord);

    if (!data) {
      return NextResponse.json({ definition: null });
    }

    const firstDefinition = data.en?.[0]?.definitions?.[0]?.definition ?? "";

    // Follow "form of" entries to their base word.
    const isFormOf = firstDefinition.includes("form-of-definition");

    if (isFormOf) {
      const baseWord = getBaseWord(data);

      if (baseWord && baseWord !== normalizedWord) {
        const baseData = await getWord(baseWord);

        if (baseData) {
          const definition = getDefinitions(baseData)[0]?.definition ?? null;

          return NextResponse.json({ definition });
        }
      }
    }

    const definition = getDefinitions(data)[0]?.definition ?? null;

    return NextResponse.json({ definition });
  } catch {
    return NextResponse.json({ definition: null }, { status: 500 });
  }
}
