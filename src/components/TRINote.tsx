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
      description = "Blocage ou pauvrete reelle de l'expression (pathologique)";
      break;

    case X === 3 && Y === 3:
      name = "Ambetique";
      description = "Sujets douees";
      break;

    case X === 0 && Y > 0:
      name = "Extratensif pur";
      description = "Emotif instable, besoins affectifs exprimes sans frein (enfants).";
      break;

    case X < Y:
      name = "Extratensif mixte";
      description = "Capable de ponderation des l'expression, les besoins (pathologique si exagere).";
      break;

    case Y === 0 && X > 0:
      name = "Intratensif pur";
      description = "Caractere reserve, absorbe des monde imaginaire > reel";
      break;

    case X > Y:
      name = "Intratensif mixte";
      description = "+ impulsif, peut avoir des incidents explosifs.";
      break;

    default:
      name = "";
      description = "";
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
