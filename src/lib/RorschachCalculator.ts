// Types for Rorschach Test Analysis
interface RorschachResponse {
  plate: number; // Plate number (1-10)
  location: Location;
  determinant: Determinant[];
  content: Content[];
  popularResponse: boolean; // Ban (Popular response)
  responseText: string;
}

type Location = 'G' | 'D' | 'Dd' | 'Dbl' | 'Ddbl' | 'Do';
type Determinant = 
  | { type: 'F'; quality: 'F+' | 'F-' | 'F+-' }
  | { type: 'C' | 'CF' | 'FC' }
  | { type: "C'" | "C'F" | "FC'" }
  | { type: 'E' | 'EF' | 'FE' }
  | { type: 'K' | 'Kan' | 'Kob' | 'Kp' }
  | { type: 'Clob' | 'ClobF' | 'FClob' };

type Content = 
  | 'H' | '(H)' | 'Hd' | '(Hd)' 
  | 'A' | '(A)' | 'Ad' | '(Ad)'
  | 'Anat' | 'Sex' | 'Nat' | 'Géo' | 'Bot' 
  | 'Obj' | 'Arch' | 'Art' | 'Abs';

interface RorschachProtocol {
  responses: RorschachResponse[];
  totalTime: number; // in seconds
  refusals: number; // number of refused plates
}

interface Psychogram {
  // Productivity
  R: number; // Total responses
  totalTime: number;
  averageTimePerResponse: number;
  averageLatencyTime: number;
  
  // Locations
  G: number;
  D: number;
  Dd: number;
  Dbl: number;
  Ddbl: number;
  Do: number;
  
  // Location percentages
  G_percent: number;
  D_percent: number;
  Dd_percent: number;
  Dbl_percent: number;
  
  // Determinants
  F: number;
  F_plus: number;
  F_minus: number;
  F_plusminus: number;
  F_percent: number;
  F_plus_percent: number;
  F_minus_percent: number;
  F_extended_percent: number;
  
  // Color responses
  FC: number;
  CF: number;
  C: number;
  sumC: number;
  
  // Achromatic responses
  FC_prime: number;
  C_primeF: number;
  C_prime: number;
  
  // Shading
  FE: number;
  EF: number;
  E: number;
  
  // Movement
  K: number;
  Kan: number;
  Kob: number;
  Kp: number;
  
  // Clair-obscure
  FClob: number;
  ClobF: number;
  Clob: number;
  
  // Content
  H: number;
  Hd: number;
  A: number;
  Ad: number;
  Anat: number;
  H_percent: number;
  A_percent: number;
  
  // Popular responses
  Ban: number;
  Ban_percent: number;
  
  // Type de Résonance Intime (TRI)
  TRI: string;
  
  // Formula Complementaire
  FC_formula: string;
  
  // RC percentage
  RC_percent: number;
  
  // Anxiety percentage
  anxiety_percent: number;
}

interface RorschachAnalysis extends Psychogram {
  interpretation: {
    cognitiveFunctioning: string;
    conflictManagement: string;
    defenses: string[];
    psychologicalStructure: string;
    recommendations: string[];
  };
}

class RorschachCalculator {
  private protocol: RorschachProtocol;
  
  constructor(protocol: RorschachProtocol) {
    this.protocol = protocol;
  }
  
  /**
   * Calculate the complete psychogram
   */
  calculatePsychogram(): Psychogram {
    const responses = this.protocol.responses;
    const R = responses.length;
    
    // Calculate locations
    const locations = this.calculateLocations(responses);
    
    // Calculate determinants
    const determinants = this.calculateDeterminants(responses);
    
    // Calculate content
    const content = this.calculateContent(responses);
    
    // Calculate popular responses
    const Ban = responses.filter(r => r.popularResponse).length;
    
    // Calculate TRI (Type de Résonance Intime)
    const TRI = this.calculateTRI(determinants.K, determinants.sumC);
    
    // Calculate Formula Complementaire
    const FC_formula = this.calculateFormulaComplementaire(
      determinants.Kan,
      determinants.Kob,
      determinants.Kp,
      determinants.E,
      determinants.C_prime
    );
    
    // Calculate RC%
    const RC_percent = this.calculateRC_Percent(responses);
    
    // Calculate anxiety percentage
    const anxiety_percent = this.calculateAnxietyPercent(content);
    
    return {
      R,
      totalTime: this.protocol.totalTime,
      averageTimePerResponse: this.protocol.totalTime / R,
      averageLatencyTime: 0, // Would need latency data per response
      
      ...locations,
      
      ...determinants,
      
      H: content.H,
      Hd: content.Hd,
      A: content.A,
      Ad: content.Ad,
      Anat: content.Anat,
      H_percent: (content.H / R) * 100,
      A_percent: (content.A / R) * 100,
      
      Ban,
      Ban_percent: (Ban / R) * 100,
      
      TRI,
      FC_formula,
      RC_percent,
      anxiety_percent
    };
  }
  
  /**
   * Calculate location statistics
   */
  private calculateLocations(responses: RorschachResponse[]) {
    const R = responses.length;
    const G = responses.filter(r => r.location === 'G').length;
    const D = responses.filter(r => r.location === 'D').length;
    const Dd = responses.filter(r => r.location === 'Dd').length;
    const Dbl = responses.filter(r => r.location === 'Dbl').length;
    const Ddbl = responses.filter(r => r.location === 'Ddbl').length;
    const Do = responses.filter(r => r.location === 'Do').length;
    
    return {
      G,
      D,
      Dd,
      Dbl,
      Ddbl,
      Do,
      G_percent: (G / R) * 100,
      D_percent: (D / R) * 100,
      Dd_percent: (Dd / R) * 100,
      Dbl_percent: (Dbl / R) * 100
    };
  }
  
  /**
   * Calculate determinant statistics
   */
  private calculateDeterminants(responses: RorschachResponse[]) {
    const R = responses.length;
    let F = 0, F_plus = 0, F_minus = 0, F_plusminus = 0;
    let FC = 0, CF = 0, C = 0;
    let FC_prime = 0, C_primeF = 0, C_prime = 0;
    let FE = 0, EF = 0, E = 0;
    let K = 0, Kan = 0, Kob = 0, Kp = 0;
    let FClob = 0, ClobF = 0, Clob = 0;
    
    responses.forEach(response => {
      response.determinant.forEach(det => {
        switch (det.type) {
          case 'F':
            F++;
            if (det.quality === 'F+') F_plus++;
            else if (det.quality === 'F-') F_minus++;
            else if (det.quality === 'F+-') F_plusminus++;
            break;
          case 'FC': FC++; break;
          case 'CF': CF++; break;
          case 'C': C++; break;
          case "FC'": FC_prime++; break;
          case "C'F": C_primeF++; break;
          case "C'": C_prime++; break;
          case 'FE': FE++; break;
          case 'EF': EF++; break;
          case 'E': E++; break;
          case 'K': K++; break;
          case 'Kan': Kan++; break;
          case 'Kob': Kob++; break;
          case 'Kp': Kp++; break;
          case 'FClob': FClob++; break;
          case 'ClobF': ClobF++; break;
          case 'Clob': Clob++; break;
        }
      });
    });
    
    // Calculate weighted sum of color responses
    const sumC = C + (CF * 0.5) + (FC * 0.5);
    
    const F_percent = F > 0 ? (F / R) * 100 : 0;
    const F_plus_percent = F > 0 ? (F_plus / F) * 100 : 0;
    const F_minus_percent = F > 0 ? (F_minus / F) * 100 : 0;
    const F_extended_percent = F > 0 ? ((F_plus + F_plusminus) / F) * 100 : 0;
    
    return {
      F, F_plus, F_minus, F_plusminus,
      F_percent, F_plus_percent, F_minus_percent, F_extended_percent,
      FC, CF, C, sumC,
      FC_prime, C_primeF, C_prime,
      FE, EF, E,
      K, Kan, Kob, Kp,
      FClob, ClobF, Clob
    };
  }
  
  /**
   * Calculate content statistics
   */
  private calculateContent(responses: RorschachResponse[]) {
    let H = 0, Hd = 0, A = 0, Ad = 0, Anat = 0;
    
    responses.forEach(response => {
      response.content.forEach(cont => {
        switch (cont) {
          case 'H': H++; break;
          case 'Hd': Hd++; break;
          case 'A': A++; break;
          case 'Ad': Ad++; break;
          case 'Anat': Anat++; break;
        }
      });
    });
    
    return { H, Hd, A, Ad, Anat };
  }
  
  /**
   * Calculate Type de Résonance Intime (TRI)
   * Inner Resonance Type
   */
  private calculateTRI(K: number, sumC: number): string {
    const ratio = K > 0 && sumC > 0 ? K / sumC : 0;
    
    if (K === 0 && sumC === 0) {
      return `${K}K/${sumC}C - Coarté (Constricted)`;
    } else if (K > sumC * 2) {
      return `${K}K/${sumC}C - Introversif (Introversive)`;
    } else if (sumC > K * 2) {
      return `${K}K/${sumC}C - Extratensif (Extratensive)`;
    } else {
      return `${K}K/${sumC}C - Ambiéqual (Ambiequal)`;
    }
  }
  
  /**
   * Calculate Formula Complementaire
   */
  private calculateFormulaComplementaire(
    Kan: number, 
    Kob: number, 
    Kp: number,
    E: number,
    C_prime: number
  ): string {
    const k_sum = Kan + Kob + Kp;
    const E_sum = E + C_prime;
    return `${k_sum}k/${E_sum}E`;
  }
  
  /**
   * Calculate RC% (Color response percentage)
   * Plates VIII, IX, X
   */
  private calculateRC_Percent(responses: RorschachResponse[]): number {
    const colorPlates = responses.filter(r => r.plate >= 8 && r.plate <= 10);
    const totalResponses = responses.length;
    return totalResponses > 0 ? (colorPlates.length / totalResponses) * 100 : 0;
  }
  
  /**
   * Calculate anxiety percentage based on anatomical content
   */
  private calculateAnxietyPercent(content: { Anat: number }): number {
    // Based on the example in the document: Angoisse = 10*100/16 = 62.5%
    // This seems to be: (Anat * 100) / R
    return content.Anat;
  }
  
  /**
   * Generate a complete analysis with interpretation
   */
  analyze(): RorschachAnalysis {
    const psychogram = this.calculatePsychogram();
    const interpretation = this.interpretResults(psychogram);
    
    return {
      ...psychogram,
      interpretation
    };
  }
  
  /**
   * Interpret the results based on the psychogram
   */
  private interpretResults(psychogram: Psychogram) {
    const interpretations: {
      cognitiveFunctioning: string;
      conflictManagement: string;
      defenses: string[];
      psychologicalStructure: string;
      recommendations: string[];
    } = {
      cognitiveFunctioning: '',
      conflictManagement: '',
      defenses: [],
      psychologicalStructure: '',
      recommendations: []
    };
    
    // Cognitive Functioning Analysis
    if (psychogram.F_percent > 80) {
      interpretations.cognitiveFunctioning = 
        'Constriction importante de la vie affective avec tendance dépressive possible';
    } else if (psychogram.F_percent < 50) {
      interpretations.cognitiveFunctioning = 
        'Débordement par les affects, difficultés de contrôle';
    }
    
    if (psychogram.F_plus_percent < 70) {
      interpretations.cognitiveFunctioning += 
        '. Difficultés dans le rapport à la réalité objective';
    }
    
    // Conflict Management
    if (psychogram.TRI.includes('Introversif')) {
      interpretations.conflictManagement = 
        'Type introverti: priorité à la pensée et à l\'intériorisation';
    } else if (psychogram.TRI.includes('Extratensif')) {
      interpretations.conflictManagement = 
        'Type extraverti: expression affective, flexibilité';
    } else if (psychogram.TRI.includes('Coarté')) {
      interpretations.conflictManagement = 
        'Type coarté: inhibition affective et fantasmatique importante';
    }
    
    // Defense Mechanisms
    if (psychogram.F_percent > 70) {
      interpretations.defenses.push('Isolation');
    }
    if (psychogram.Dbl > 0) {
      interpretations.defenses.push('Projection');
    }
    if (psychogram.F_minus_percent > 30) {
      interpretations.defenses.push('Projection pathologique');
    }
    
    // Psychological Structure
    if (psychogram.F_minus_percent > 30 && psychogram.Ban_percent < 15) {
      interpretations.psychologicalStructure = 
        'Indications de fonctionnement psychotique possible';
    } else if (psychogram.G_percent > 50 && psychogram.D_percent < 30) {
      interpretations.psychologicalStructure = 
        'Organisation névrotique avec tendance obsessionnelle';
    } else if (psychogram.anxiety_percent > 50) {
      interpretations.psychologicalStructure = 
        'État limite avec préoccupations somatiques importantes';
    }
    
    // Recommendations
    if (psychogram.R < 15) {
      interpretations.recommendations.push(
        'Productivité faible: explorer les résistances au test'
      );
    }
    if (psychogram.F_plus_percent < 60) {
      interpretations.recommendations.push(
        'Distorsions perceptives: approfondir l\'évaluation'
      );
    }
    if (psychogram.H === 0) {
      interpretations.recommendations.push(
        'Absence de représentations humaines: difficultés identificatoires'
      );
    }
    
    return interpretations;
  }
}

// Example usage
const exampleProtocol: RorschachProtocol = {
  responses: [
    {
      plate: 1,
      location: 'G',
      determinant: [{ type: 'F', quality: 'F+' }],
      content: ['A'],
      popularResponse: true,
      responseText: 'Un papillon'
    },
    {
      plate: 2,
      location: 'D',
      determinant: [{ type: 'CF' }],
      content: ['Anat'],
      popularResponse: false,
      responseText: 'Des poumons'
    }
    // ... more responses
  ],
  totalTime: 900, // 15 minutes
  refusals: 0
};

// Calculate results
const calculator = new RorschachCalculator(exampleProtocol);
const analysis = calculator.analyze();

console.log('Psychogram:', analysis);
console.log('Interpretation:', analysis.interpretation);