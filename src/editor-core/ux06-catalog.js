// UX-06 H2F — símbolos de referência, sem reproduzir tabelas normativas.
export const UX06_INSPECTION_SPECS=Object.freeze([
  {
    "id": "insp-cml",
    "name": "Ponto CML",
    "code": "CML",
    "variant": "CML",
    "recordKind": "TML"
  },
  {
    "id": "insp-weld-butt",
    "name": "Solda de topo / BW",
    "code": "BW",
    "variant": "WELD_BUTT",
    "recordKind": "WELD"
  },
  {
    "id": "insp-weld-fillet",
    "name": "Solda de filete / FW",
    "code": "FW",
    "variant": "WELD_FILLET",
    "recordKind": "WELD"
  },
  {
    "id": "insp-weld-field",
    "name": "Solda de campo",
    "code": "FWLD",
    "variant": "WELD_FIELD",
    "recordKind": "WELD"
  },
  {
    "id": "insp-weld-shop",
    "name": "Solda de fabricação",
    "code": "SWLD",
    "variant": "WELD_SHOP",
    "recordKind": "WELD"
  },
  {
    "id": "insp-thickness",
    "name": "Medição de espessura",
    "code": "THK",
    "variant": "THICKNESS",
    "recordKind": "TML"
  },
  {
    "id": "insp-corrosion",
    "name": "Área com corrosão",
    "code": "COR",
    "variant": "CORROSION",
    "recordKind": "VISUAL"
  },
  {
    "id": "insp-crack",
    "name": "Indicação de trinca",
    "code": "CRK",
    "variant": "CRACK",
    "recordKind": "VISUAL"
  },
  {
    "id": "insp-pitting",
    "name": "Corrosão localizada / pites",
    "code": "PIT",
    "variant": "PITTING",
    "recordKind": "VISUAL"
  },
  {
    "id": "insp-leak",
    "name": "Ponto de vazamento",
    "code": "LEAK",
    "variant": "LEAK",
    "recordKind": "VISUAL"
  },
  {
    "id": "insp-repair",
    "name": "Área de reparo",
    "code": "REP",
    "variant": "REPAIR",
    "recordKind": "VISUAL"
  },
  {
    "id": "insp-replace",
    "name": "Substituição de trecho",
    "code": "REPL",
    "variant": "REPLACE",
    "recordKind": "VISUAL"
  },
  {
    "id": "insp-coating",
    "name": "Dano em revestimento",
    "code": "COAT",
    "variant": "COATING",
    "recordKind": "VISUAL"
  },
  {
    "id": "insp-cui",
    "name": "Ponto CUI",
    "code": "CUI",
    "variant": "CUI",
    "recordKind": "VISUAL"
  },
  {
    "id": "insp-hotspot",
    "name": "Ponto de atenção térmica",
    "code": "HOT",
    "variant": "HOTSPOT",
    "recordKind": "VISUAL"
  }
]);
export const UX06_NDT_SPECS=Object.freeze([
  {
    "id": "ndt-paut",
    "name": "Ultrassom phased array",
    "code": "PAUT",
    "variant": "PAUT",
    "method": "PAUT"
  },
  {
    "id": "ndt-tofd",
    "name": "Ultrassom TOFD",
    "code": "TOFD",
    "variant": "TOFD",
    "method": "TOFD"
  },
  {
    "id": "ndt-ut-thickness",
    "name": "UT medição de espessura",
    "code": "UTM",
    "variant": "UT_THICKNESS",
    "method": "UT"
  },
  {
    "id": "ndt-ut-shear",
    "name": "UT feixe angular",
    "code": "UT-A",
    "variant": "UT_SHEAR",
    "method": "UT"
  },
  {
    "id": "ndt-rfa",
    "name": "RFA / Remote Field",
    "code": "RFA",
    "variant": "RFA",
    "method": "RFA"
  },
  {
    "id": "ndt-acfm",
    "name": "ACFM",
    "code": "ACFM",
    "variant": "ACFM",
    "method": "OTHER"
  },
  {
    "id": "ndt-pmi",
    "name": "Identificação positiva de materiais",
    "code": "PMI",
    "variant": "PMI",
    "method": "OTHER"
  },
  {
    "id": "ndt-vt",
    "name": "Inspeção visual",
    "code": "VT",
    "variant": "VT",
    "method": "OTHER"
  },
  {
    "id": "ndt-lt",
    "name": "Ensaio de estanqueidade",
    "code": "LT",
    "variant": "LT",
    "method": "OTHER"
  },
  {
    "id": "ndt-thermography",
    "name": "Termografia infravermelha",
    "code": "IRT",
    "variant": "THERMOGRAPHY",
    "method": "OTHER"
  },
  {
    "id": "ndt-pec",
    "name": "PEC / Pulsed Eddy Current",
    "code": "PEC",
    "variant": "PEC",
    "method": "ET"
  },
  {
    "id": "ndt-bobbin",
    "name": "ET bobbin",
    "code": "ECT",
    "variant": "BOBBIN",
    "method": "ET"
  },
  {
    "id": "ndt-rft",
    "name": "RFT / Remote Field Testing",
    "code": "RFT",
    "variant": "RFT",
    "method": "RFA"
  },
  {
    "id": "ndt-mfl-floor",
    "name": "MFL fundo de tanque",
    "code": "MFL-T",
    "variant": "MFL_FLOOR",
    "method": "MFL"
  },
  {
    "id": "ndt-hardness",
    "name": "Dureza superficial",
    "code": "HARD",
    "variant": "HARDNESS",
    "method": "OTHER"
  },
  {
    "id": "ndt-replica",
    "name": "Réplica metalográfica",
    "code": "REPL",
    "variant": "REPLICA",
    "method": "OTHER"
  }
]);
export const UX06_ANNOTATION_SPECS=Object.freeze([
  {
    "id": "ann-callout",
    "name": "Balão de chamada",
    "code": "NOTE",
    "variant": "CALLOUT"
  },
  {
    "id": "ann-cloud",
    "name": "Nuvem de revisão",
    "code": "CLOUD",
    "variant": "CLOUD"
  },
  {
    "id": "ann-box",
    "name": "Caixa de nota",
    "code": "BOX",
    "variant": "BOX"
  },
  {
    "id": "ann-warning",
    "name": "Alerta técnico",
    "code": "WARN",
    "variant": "WARNING"
  },
  {
    "id": "ann-check",
    "name": "Ponto verificado",
    "code": "CHECK",
    "variant": "CHECK"
  },
  {
    "id": "ann-question",
    "name": "Pendência de campo",
    "code": "PEND",
    "variant": "QUESTION"
  },
  {
    "id": "ann-hold",
    "name": "Ponto de espera / hold",
    "code": "HOLD",
    "variant": "HOLD"
  },
  {
    "id": "ann-reference",
    "name": "Referência cruzada",
    "code": "REF",
    "variant": "REFERENCE"
  },
  {
    "id": "ann-break",
    "name": "Ruptura de vista",
    "code": "BREAK",
    "variant": "BREAK"
  },
  {
    "id": "ann-measure",
    "name": "Nota de medição",
    "code": "MED",
    "variant": "MEASURE"
  },
  {
    "id": "ann-balloon",
    "name": "Marcador numerado",
    "code": "1",
    "variant": "BALLOON"
  },
  {
    "id": "ann-dashed-zone",
    "name": "Área delimitada",
    "code": "ZONE",
    "variant": "ZONE"
  }
]);
export const UX06_SHEET_SPECS=Object.freeze([
  {
    "id": "sheet-match-line",
    "name": "Match line / limite de folha",
    "code": "ML",
    "variant": "MATCH_LINE"
  },
  {
    "id": "sheet-continuation-in",
    "name": "Continuação entrada",
    "code": "IN",
    "variant": "CONTINUATION_IN"
  },
  {
    "id": "sheet-continuation-out",
    "name": "Continuação saída",
    "code": "OUT",
    "variant": "CONTINUATION_OUT"
  },
  {
    "id": "sheet-section",
    "name": "Corte / seção",
    "code": "A-A",
    "variant": "SECTION"
  },
  {
    "id": "sheet-detail",
    "name": "Detalhe ampliado",
    "code": "DET",
    "variant": "DETAIL"
  },
  {
    "id": "sheet-datum",
    "name": "Referência / datum",
    "code": "DAT",
    "variant": "DATUM"
  },
  {
    "id": "sheet-slope",
    "name": "Sentido de declividade",
    "code": "SLOPE",
    "variant": "SLOPE"
  },
  {
    "id": "sheet-field-weld",
    "name": "Nota solda de campo",
    "code": "FW",
    "variant": "FIELD_WELD"
  },
  {
    "id": "sheet-hold-point",
    "name": "Ponto de espera documental",
    "code": "HP",
    "variant": "HOLD_POINT"
  },
  {
    "id": "sheet-legend",
    "name": "Legenda de símbolos",
    "code": "LEG",
    "variant": "LEGEND"
  },
  {
    "id": "sheet-sheet-ref",
    "name": "Referência a outra folha",
    "code": "SH",
    "variant": "SHEET_REF"
  }
]);
