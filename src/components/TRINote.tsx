import React from "react";

function analyzeTRINote(note = "") {
  // Regex: captures X before K/k and Y before C/c, allowing spaces
  const match = note.match(/^\s*(\d+)\s*[Kk]\s*\/\s*(\d+)\s*[Cc]\s*$/);

  if (!match) {
    return {
      name: "Invalid format",
      description: "The note format should be like '3K/2C' (e.g., 2K/5C, 0K/0C).",
    };
  }

  const X = Number(match[1]);
  const Y = Number(match[2]);

  let name = "";
  let description = "";

  switch (true) {
    case X === 0 && Y === 0:
      name = "Coarite pur";
      description = "This note indicates a complete absence of both K and C.";
      break;

    case X === 3 && Y === 3:
      name = "Ambetique";
      description = "This note indicates a balanced presence of K and C.";
      break;

    case X === 0 && Y > 0:
      name = "Extratensif pur";
      description = "This note indicates a complete absence of K with a presence of C.";
      break;

    case X < Y:
      name = "Extratensif mixte";
      description = "This note indicates a mixed presence of K and C, with more C than K.";
      break;

    case Y === 0 && X > 0:
      name = "Intratensif pur";
      description = "This note indicates a complete absence of C with a presence of K.";
      break;

    case X > Y:
      name = "Intratensif mixte";
      description = "This note indicates a mixed presence of K and C, with more K than C.";
      break;

    default:
      name = "Unclassified";
      description = "This note does not match any defined TRI categories.";
  }

  return { name, description };
}

const TRINote = ({ TRI }) => {
  const analysis = analyzeTRINote(TRI);

  return (
    <div>
      <p>{analysis.name}</p>
      <p>{analysis.description}</p>
    </div>
  );
};

export default TRINote;
