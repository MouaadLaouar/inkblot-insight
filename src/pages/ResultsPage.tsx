import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, FileText } from "lucide-react";

// Mock data for demonstration
const mockPatient = {
  firstName: "John",
  lastName: "Doe",
  medicalRecordNumber: "MRN-12345",
  dateOfBirth: "1985-05-15",
  testDate: "2025-10-10",
};

const mockResponses = [
  { card: 1, responseNumber: 1, location: "W", determinants: ["F"], content: ["A"], formQuality: "o" },
  { card: 1, responseNumber: 2, location: "D", determinants: ["FM"], content: ["A"], formQuality: "+" },
  { card: 2, responseNumber: 1, location: "W", determinants: ["M", "FC"], content: ["H"], formQuality: "o" },
  { card: 2, responseNumber: 2, location: "D", determinants: ["C"], content: ["Bl"], formQuality: "-" },
  { card: 3, responseNumber: 1, location: "D", determinants: ["M"], content: ["H"], formQuality: "o" },
  { card: 3, responseNumber: 2, location: "Dd", determinants: ["F"], content: ["Hd"], formQuality: "u" },
  { card: 4, responseNumber: 1, location: "W", determinants: ["F", "Y"], content: ["A"], formQuality: "o" },
  { card: 5, responseNumber: 1, location: "W", determinants: ["F"], content: ["A"], formQuality: "o" },
  { card: 5, responseNumber: 2, location: "D", determinants: ["F"], content: ["Ad"], formQuality: "o" },
  { card: 6, responseNumber: 1, location: "W", determinants: ["FT"], content: ["A"], formQuality: "o" },
  { card: 7, responseNumber: 1, location: "D", determinants: ["M"], content: ["H"], formQuality: "+" },
  { card: 7, responseNumber: 2, location: "D", determinants: ["F"], content: ["A"], formQuality: "o" },
  { card: 8, responseNumber: 1, location: "W", determinants: ["FC"], content: ["A"], formQuality: "o" },
  { card: 8, responseNumber: 2, location: "D", determinants: ["F"], content: ["A"], formQuality: "o" },
  { card: 9, responseNumber: 1, location: "W", determinants: ["FM", "CF"], content: ["A"], formQuality: "v" },
  { card: 9, responseNumber: 2, location: "Dd", determinants: ["F"], content: ["Hd"], formQuality: "u" },
  { card: 10, responseNumber: 1, location: "W", determinants: ["FC"], content: ["A"], formQuality: "o" },
  { card: 10, responseNumber: 2, location: "D", determinants: ["F"], content: ["A"], formQuality: "o" },
  { card: 10, responseNumber: 3, location: "D", determinants: ["FC"], content: ["Bt"], formQuality: "o" },
  { card: 10, responseNumber: 4, location: "Dd", determinants: ["F"], content: ["An"], formQuality: "u" },
];

const calculateStats = () => {
  const totalResponses = mockResponses.length;

  // Location percentages
  const wCount = mockResponses.filter(r => r.location === "W").length;
  const dCount = mockResponses.filter(r => r.location === "D").length;
  const ddCount = mockResponses.filter(r => r.location === "Dd").length;
  const sCount = mockResponses.filter(r => r.location === "S").length;

  // Determinants
  const allDeterminants = mockResponses.flatMap(r => r.determinants);
  const fCount = allDeterminants.filter(d => d === "F").length;
  const mCount = allDeterminants.filter(d => d === "M").length;
  const fmCount = allDeterminants.filter(d => d === "FM").length;
  const cCount = allDeterminants.filter(d => d.includes("C")).length;
  const tCount = allDeterminants.filter(d => d.includes("T")).length;
  const yCount = allDeterminants.filter(d => d.includes("Y")).length;

  // Content
  const allContent = mockResponses.flatMap(r => r.content);
  const hCount = allContent.filter(c => c === "H" || c === "Hd" || c === "(H)" || c === "(Hd)").length;
  const aCount = allContent.filter(c => c === "A" || c === "Ad" || c === "(A)" || c === "(Ad)").length;

  // Form Quality
  const fqPlus = mockResponses.filter(r => r.formQuality === "+").length;
  const fqOrdinary = mockResponses.filter(r => r.formQuality === "o").length;
  const fqUnusual = mockResponses.filter(r => r.formQuality === "u").length;
  const fqMinus = mockResponses.filter(r => r.formQuality === "-").length;
  const fqNo = mockResponses.filter(r => r.formQuality === "v").length;

  return {
    totalResponses,
    location: {
      W: { count: wCount, percentage: Math.round((wCount / totalResponses) * 100) },
      D: { count: dCount, percentage: Math.round((dCount / totalResponses) * 100) },
      Dd: { count: ddCount, percentage: Math.round((ddCount / totalResponses) * 100) },
      S: { count: sCount, percentage: Math.round((sCount / totalResponses) * 100) },
    },
    determinants: {
      F: fCount,
      M: mCount,
      FM: fmCount,
      Color: cCount,
      Texture: tCount,
      Shading: yCount,
      pureF: Math.round((fCount / allDeterminants.length) * 100),
    },
    content: {
      Human: { count: hCount, percentage: Math.round((hCount / allContent.length) * 100) },
      Animal: { count: aCount, percentage: Math.round((aCount / allContent.length) * 100) },
    },
    formQuality: {
      superior: fqPlus,
      ordinary: fqOrdinary,
      unusual: fqUnusual,
      minus: fqMinus,
      noForm: fqNo,
    },
  };
};

const ResultsPage = () => {
  const navigate = useNavigate();
  const stats = calculateStats();

  const getInterpretation = () => {
    const interpretations = [];

    // Response productivity
    if (stats.totalResponses < 14) {
      interpretations.push({
        category: "Response Productivity",
        finding: "Below average response productivity",
        interpretation: "The total number of responses (R=" + stats.totalResponses + ") is below the typical range (14-27), suggesting possible constriction, depression, or limited cognitive resources.",
      });
    } else if (stats.totalResponses > 27) {
      interpretations.push({
        category: "Response Productivity",
        finding: "Above average response productivity",
        interpretation: "The elevated number of responses suggests high ideational activity, which may indicate creativity or possible obsessive tendencies.",
      });
    } else {
      interpretations.push({
        category: "Response Productivity",
        finding: "Normal response productivity",
        interpretation: "The response count is within normal limits, suggesting adequate cognitive and perceptual resources.",
      });
    }

    // Location analysis
    if (stats.location.W.percentage > 50) {
      interpretations.push({
        category: "Perceptual Approach",
        finding: "Elevated Whole responses (W=" + stats.location.W.percentage + "%)",
        interpretation: "High W% suggests a tendency toward generalization and abstract thinking, possibly indicating ambitious goal-setting or oversimplification.",
      });
    }

    if (stats.location.D.percentage < 30) {
      interpretations.push({
        category: "Perceptual Approach",
        finding: "Low Detail responses (D=" + stats.location.D.percentage + "%)",
        interpretation: "Reduced attention to common details may suggest unconventional perceptual approach or difficulty with practical problem-solving.",
      });
    }

    // Form quality
    const fqXPlus = Math.round((stats.formQuality.superior / stats.totalResponses) * 100);
    const fqMinus = Math.round((stats.formQuality.minus / stats.totalResponses) * 100);

    if (fqMinus > 20) {
      interpretations.push({
        category: "Reality Testing",
        finding: "Elevated distorted perceptions (FQ-=" + fqMinus + "%)",
        interpretation: "The high proportion of minus form quality responses suggests significant perceptual distortion and potential reality testing problems.",
      });
    } else if (fqMinus > 10) {
      interpretations.push({
        category: "Reality Testing",
        finding: "Moderately elevated distorted perceptions (FQ-=" + fqMinus + "%)",
        interpretation: "Some perceptual inaccuracy is present, which may indicate stress-related perceptual distortions or unconventional thinking.",
      });
    }

    // Human movement
    if (stats.determinants.M >= 4) {
      interpretations.push({
        category: "Ideational Activity",
        finding: "Good human movement responses (M=" + stats.determinants.M + ")",
        interpretation: "Adequate capacity for introspection, imagination, and deliberate problem-solving. Suggests good cognitive resources.",
      });
    } else if (stats.determinants.M < 2) {
      interpretations.push({
        category: "Ideational Activity",
        finding: "Limited human movement responses (M=" + stats.determinants.M + ")",
        interpretation: "Reduced capacity for reflection and internal processing, possibly indicating action-oriented coping or limited introspection.",
      });
    }

    // Color responses
    if (stats.determinants.Color >= 3) {
      interpretations.push({
        category: "Affective Processing",
        finding: "Adequate color responses",
        interpretation: "Normal emotional reactivity and capacity for affective processing. Suggests appropriate emotional engagement.",
      });
    } else {
      interpretations.push({
        category: "Affective Processing",
        finding: "Limited color responses",
        interpretation: "Possible emotional constriction or guardedness in affective expression.",
      });
    }

    // Content analysis
    if (stats.content.Human.percentage < 15) {
      interpretations.push({
        category: "Interpersonal Perception",
        finding: "Low human content (H=" + stats.content.Human.percentage + "%)",
        interpretation: "Limited human content suggests possible interpersonal discomfort or reduced interest in social relationships.",
      });
    }

    if (stats.content.Animal.percentage > 50) {
      interpretations.push({
        category: "Cognitive Processing",
        finding: "Elevated animal content (A=" + stats.content.Animal.percentage + "%)",
        interpretation: "High animal content percentage indicates conventional, possibly stereotyped thinking patterns.",
      });
    }

    return interpretations;
  };

  const interpretations = getInterpretation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-clinical-gray/20 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">
                Rorschach Test Results - {mockPatient.lastName}, {mockPatient.firstName}
              </h1>
              <p className="text-sm text-muted-foreground">
                Test Date: {new Date(mockPatient.testDate).toLocaleDateString()} | MRN: {mockPatient.medicalRecordNumber}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="secondary">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Summary Statistics */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
            <CardDescription>Overview of test administration and response patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats.totalResponses}</div>
                <div className="text-sm text-muted-foreground">Total Responses (R)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats.location.W.count}</div>
                <div className="text-sm text-muted-foreground">Whole Responses (W)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats.determinants.M}</div>
                <div className="text-sm text-muted-foreground">Human Movement (M)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats.determinants.pureF}%</div>
                <div className="text-sm text-muted-foreground">Pure Form (F%)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="structural" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="structural">Structural Summary</TabsTrigger>
            <TabsTrigger value="location">Location Analysis</TabsTrigger>
            <TabsTrigger value="determinants">Determinants</TabsTrigger>
            <TabsTrigger value="interpretation">Interpretation</TabsTrigger>
          </TabsList>

          <TabsContent value="structural" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Form Quality Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Superior (+)</span>
                      <Badge variant="outline">{stats.formQuality.superior}</Badge>
                    </div>
                    <Progress value={(stats.formQuality.superior / stats.totalResponses) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Ordinary (o)</span>
                      <Badge variant="outline">{stats.formQuality.ordinary}</Badge>
                    </div>
                    <Progress value={(stats.formQuality.ordinary / stats.totalResponses) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Unusual (u)</span>
                      <Badge variant="outline">{stats.formQuality.unusual}</Badge>
                    </div>
                    <Progress value={(stats.formQuality.unusual / stats.totalResponses) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Minus (-)</span>
                      <Badge variant="destructive">{stats.formQuality.minus}</Badge>
                    </div>
                    <Progress value={(stats.formQuality.minus / stats.totalResponses) * 100} className="bg-destructive/20" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">No Form (v)</span>
                      <Badge variant="outline">{stats.formQuality.noForm}</Badge>
                    </div>
                    <Progress value={(stats.formQuality.noForm / stats.totalResponses) * 100} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Human Content (H)</span>
                      <Badge>{stats.content.Human.percentage}%</Badge>
                    </div>
                    <Progress value={stats.content.Human.percentage} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Animal Content (A)</span>
                      <Badge>{stats.content.Animal.percentage}%</Badge>
                    </div>
                    <Progress value={stats.content.Animal.percentage} />
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      H: {stats.content.Human.count} | A: {stats.content.Animal.count}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Location Features</CardTitle>
                <CardDescription>Distribution of response locations across the inkblots</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Whole (W)</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.location.W.count} responses ({stats.location.W.percentage}%)
                    </span>
                  </div>
                  <Progress value={stats.location.W.percentage} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Indicates ability to organize and integrate complex information
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Common Detail (D)</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.location.D.count} responses ({stats.location.D.percentage}%)
                    </span>
                  </div>
                  <Progress value={stats.location.D.percentage} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Reflects attention to obvious, practical details
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Unusual Detail (Dd)</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.location.Dd.count} responses ({stats.location.Dd.percentage}%)
                    </span>
                  </div>
                  <Progress value={stats.location.Dd.percentage} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">
                    May suggest attention to minutiae or unconventional focus
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">White Space (S)</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.location.S.count} responses ({stats.location.S.percentage}%)
                    </span>
                  </div>
                  <Progress value={stats.location.S.percentage} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Can indicate oppositional tendencies or negative affect
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="determinants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Determinant Analysis</CardTitle>
                <CardDescription>Features that determined the responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Movement Responses</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Human Movement (M)</span>
                        <Badge variant="secondary">{stats.determinants.M}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Animal Movement (FM)</span>
                        <Badge variant="secondary">{stats.determinants.FM}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Color & Shading</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Chromatic Color</span>
                        <Badge variant="secondary">{stats.determinants.Color}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Texture</span>
                        <Badge variant="secondary">{stats.determinants.Texture}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Shading</span>
                        <Badge variant="secondary">{stats.determinants.Shading}</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Pure Form Percentage</h4>
                  <div className="flex items-center gap-4">
                    <Progress value={stats.determinants.pureF} className="flex-1" />
                    <span className="font-bold text-xl">{stats.determinants.pureF}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Normal range: 35-50%. Higher values suggest emotional constriction; lower values may indicate affective flooding.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interpretation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Interpretation</CardTitle>
                <CardDescription>Professional interpretation of test findings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {interpretations.map((item, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{item.category}</h4>
                      <Badge variant="outline">{item.finding}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.interpretation}</p>
                  </div>
                ))}

                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Clinical Note
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    This automated interpretation is based on normative data and should be integrated with clinical
                    interview, behavioral observations, and other assessment data. The Rorschach is most effective
                    when used as part of a comprehensive psychological evaluation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ResultsPage;
