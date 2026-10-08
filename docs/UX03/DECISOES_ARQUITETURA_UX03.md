# DECISÕES DE ARQUITETURA — UX-03

## 1. Contexto não equivale a conformidade normativa
Uma referência técnica é registrada para rastreabilidade. O desenho H2F permanece `REFERENCE_GUIDED` e `TECHNICAL_REVIEW_REQUIRED` até validação específica.

## 2. Ports fazem parte da semântica
Portas não são inferidas apenas pela categoria visual. Cada símbolo recebe layout de ports apropriado à sua função.

## 3. Placement faz parte do símbolo
A biblioteca informa se o símbolo é DRAW, INLINE, JUNCTION, TERMINAL, ATTACHED, FREE ou SHEET.

## 4. Snap é metadado do símbolo
A política de snap é transportada para a entidade inserida, criando a infraestrutura para controle por objeto.

## 5. Retrocompatibilidade
Bibliotecas custom v1 continuam importáveis e são migradas para v2.

## 6. Scene Graph e Engineering Graph permanecem separados
A UX-03 não acopla forma gráfica e semântica física.
