/**
 * Serialise structured data for a `<script type="application/ld+json">` tag.
 *
 * `JSON.stringify` does not escape `<`, so a value containing `</script>` (a
 * post title, say) would close the tag early and let the rest be parsed as
 * HTML. Escaping `<` as `\u003c` keeps the JSON identical to parsers.
 */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
