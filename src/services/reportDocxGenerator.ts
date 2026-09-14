/**
 * Official Word (.docx) Report Generator for OIML R-76 NAWI Test Reports
 * Uses docx library to construct structured, editable, government-standard technical reports.
 */

import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  Packer,
} from 'docx';
import { TestReport } from '../types';

export async function generateAndDownloadDocxReport(report: TestReport): Promise<void> {
  const session = report.testSession;
  const inst = session.instrument;
  const env = session.environmental;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch in twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          // Institutional Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'GOVERNMENT OF INDIA',
                bold: true,
                size: 24,
                color: '162F4D',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION',
                bold: true,
                size: 22,
                color: '2F699C',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'DEPARTMENT OF CONSUMER AFFAIRS — LEGAL METROLOGY DIVISION',
                size: 20,
                color: '234B70',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `${report.laboratoryName} — ${report.laboratoryAddress}`,
                size: 18,
                italics: true,
                color: '6F7478',
              }),
            ],
          }),
          new Paragraph({ text: '' }), // spacing

          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'TYPE EVALUATION TEST REPORT FOR NON-AUTOMATIC WEIGHING INSTRUMENT (NAWI)',
                bold: true,
                size: 26,
                color: '162F4D',
                underline: {},
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Conforming to OIML Recommendation R-76-1:2006 & Legal Metrology (General) Rules, 2011',
                italics: true,
                size: 18,
                color: '234B70',
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Metadata Grid
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '1. REPORT METADATA & VERIFICATION',
                bold: true,
                size: 20,
                color: '162F4D',
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Report Number:', bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: report.reportNumber })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Date of Issue:', bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: new Date(report.issuedAt).toLocaleDateString() })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Document Version:', bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: `v${report.version}` })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Overall Compliance:', bold: true })] })],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: session.complianceStatus,
                            bold: true,
                            color: session.complianceStatus === 'PASS' ? '1A7A4A' : 'C0392B',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Cryptographic SHA-256 Hash:', bold: true })] })],
                  }),
                  new TableCell({
                    columnSpan: 3,
                    children: [new Paragraph({ text: report.sha256Hash })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'QR Verification Token:', bold: true })] })],
                  }),
                  new TableCell({
                    columnSpan: 3,
                    children: [new Paragraph({ text: report.verificationToken })],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Section 2: Instrument Specifications
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '2. INSTRUMENT SPECIFICATIONS & APPLICANT DETAILS',
                bold: true,
                size: 20,
                color: '162F4D',
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Manufacturer:', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: inst.manufacturer })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Model Name / Number:', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: inst.model })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Serial Number:', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: inst.serialNumber })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Instrument Type:', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: inst.type })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Accuracy Class:', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `Class ${inst.accuracyClass}` })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Max Capacity (Max):', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `${inst.maxCapacity} ${inst.unit}` })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Min Capacity (Min):', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `${inst.minCapacity} ${inst.unit}` })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Verification Interval (e):', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `${inst.verificationScaleInterval_e} ${inst.unit}` })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Actual Scale Interval (d):', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `${inst.actualScaleInterval_d} ${inst.unit}` })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Scale Intervals (n):', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `${inst.numberOfIntervals_n}` })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Applicant Name:', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: inst.applicantName })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Application Reference:', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: inst.applicationRef })] }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Section 3: Environmental Conditions
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '3. LABORATORY & ENVIRONMENTAL CONDITIONS DURING TEST',
                bold: true,
                size: 20,
                color: '162F4D',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Ambient Temperature: ${env.temperatureMin}°C to ${env.temperatureMax}°C  |  ` }),
              new TextRun({ text: `Relative Humidity: ${env.relativeHumidity}%  |  ` }),
              new TextRun({ text: `Barometric Pressure: ${env.atmosphericPressure} hPa  |  ` }),
              new TextRun({ text: `Mains Supply: ${env.supplyVoltage}V, ${env.supplyFrequency}Hz` }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Section 4: Weighing Test Table
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '4. WEIGHING PERFORMANCE TEST OBSERVATIONS (OIML R-76 CLAUSE A.4.4)',
                bold: true,
                size: 20,
                color: '162F4D',
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Step', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Direction', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Applied Load (${inst.unit})`, bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Indication (${inst.unit})`, bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Error E (${inst.unit})`, bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `MPE (±${inst.unit})`, bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Compliance', bold: true })] })] }),
                ],
              }),
              ...session.weighingObservations.map(
                (obs) =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: String(obs.step) })] }),
                      new TableCell({ children: [new Paragraph({ text: obs.loadDirection })] }),
                      new TableCell({ children: [new Paragraph({ text: String(obs.appliedLoad_L) })] }),
                      new TableCell({ children: [new Paragraph({ text: String(obs.indication_I) })] }),
                      new TableCell({ children: [new Paragraph({ text: String(obs.calculatedError_E) })] }),
                      new TableCell({ children: [new Paragraph({ text: `±${obs.mpe}` })] }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: obs.status,
                                bold: true,
                                color: obs.status === 'PASS' ? '1A7A4A' : 'C0392B',
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  })
              ),
            ],
          }),
          new Paragraph({ text: '' }),

          // Section 5: Other Tests
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '5. SPECIALIZED METROLOGICAL EVALUATION SUMMARY',
                bold: true,
                size: 20,
                color: '162F4D',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Repeatability Test (Clause A.4.4.1): ', bold: true }),
              new TextRun({
                text: `Max Spread = ${session.repeatabilityTest.maxSpread} ${inst.unit} (Limit: ${session.repeatabilityTest.mpeSpreadLimit} ${inst.unit}) — Result: ${session.repeatabilityTest.status}\n`,
              }),
              new TextRun({ text: 'Eccentricity Test (Clause A.4.7): ', bold: true }),
              new TextRun({
                text: `Evaluated at 5 positions at ${session.eccentricityTest.appliedLoad} ${inst.unit} — Result: ${session.eccentricityTest.status}\n`,
              }),
              new TextRun({ text: 'Discrimination Test (Clause A.4.8): ', bold: true }),
              new TextRun({
                text: `Tested with 1.4d additional load — Result: ${session.discriminationTest.every((d) => d.passed) ? 'PASS' : 'FAIL'}\n`,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Final Signatory Block
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '6. VERDICT & AUTHORIZATION',
                bold: true,
                size: 20,
                color: '162F4D',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Overall Verdict: ${session.overallVerdict}\n\n`,
                bold: true,
                color: '162F4D',
              }),
              new TextRun({
                text: `Testing Officer / Lab Technician: ${session.technicianName}\n`,
              }),
              new TextRun({
                text: `Authorized Technical Signatory: ${report.authorizedSignatory} (${report.designation})\n`,
              }),
              new TextRun({
                text: 'Ministry of Consumer Affairs, Food & Public Distribution | Legal Metrology Portal\n',
                italics: true,
                size: 16,
                color: '6F7478',
              }),
            ],
          }),
        ],
      },
    ],
  });

  // Pack into blob and trigger browser download
  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${report.reportNumber}_OIML_R76_TestReport.docx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
