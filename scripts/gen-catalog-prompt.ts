import { catalog } from '../frontend/src/catalog'
import { writeFileSync } from 'fs'
import { z } from 'zod'

type ZodTypeName = string

function zodTypeToString(schema: z.ZodTypeAny): string {
  const def = (schema as unknown as { _def: { typeName: ZodTypeName; values?: string[]; innerType?: z.ZodTypeAny; type?: z.ZodTypeAny; schema?: z.ZodTypeAny } })._def
  switch (def.typeName) {
    case 'ZodString': return 'string'
    case 'ZodNumber': return 'number'
    case 'ZodBoolean': return 'boolean'
    case 'ZodUnknown': return 'any'
    case 'ZodArray': return `${zodTypeToString(def.type as z.ZodTypeAny)}[]`
    case 'ZodEnum': return (def.values as string[]).map(v => `"${v}"`).join(' | ')
    case 'ZodNullable': return `${zodTypeToString(def.innerType as z.ZodTypeAny)} | null`
    case 'ZodOptional': return `${zodTypeToString(def.innerType as z.ZodTypeAny)}?`
    case 'ZodObject': return 'object'
    default: return 'any'
  }
}

function buildPrompt(): string {
  const lines: string[] = []

  lines.push('# VibeForge Component Catalog')
  lines.push('')
  lines.push('Auto-generated reference for all components and actions available in screen JSON files.')
  lines.push('')
  lines.push('## Custom Rules')
  lines.push('')
  lines.push('- Always include a $schema reference at the top of the screen file.')
  lines.push('- Always define data calls in the screen `data` array, not inline in elements.')
  lines.push('- Use Column as the root element for all screens.')
  lines.push('- Use descriptive element IDs like "post-title-field" not "field1".')
  lines.push('- Every component accepts an optional `className` prop (string) to append Tailwind utility classes to its root element.')
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## Components')
  lines.push('')

  for (const name of catalog.componentNames) {
    const component = catalog.components[name] as {
      description?: string
      hasChildren?: boolean
      props: z.ZodObject<z.ZodRawShape>
    }
    lines.push(`### ${name}`)
    lines.push('')
    if (component.description) {
      lines.push(component.description)
      lines.push('')
    }
    if (component.hasChildren) {
      lines.push('Accepts children: **yes**')
      lines.push('')
    }
    const shape = component.props.shape
    if (Object.keys(shape).length > 0) {
      lines.push('**Props:**')
      lines.push('')
      lines.push('| Prop | Type | Notes |')
      lines.push('|------|------|-------|')
      for (const [propName, propSchema] of Object.entries(shape)) {
        const typeStr = zodTypeToString(propSchema as z.ZodTypeAny)
        const isOptional = typeStr.endsWith('?') || typeStr.includes('null') || (propSchema as z.ZodTypeAny)._def.typeName === 'ZodOptional' || (propSchema as z.ZodTypeAny)._def.typeName === 'ZodNullable'
        lines.push(`| \`${propName}\` | ${typeStr.replace(/\?$/, '')} | ${isOptional ? 'optional' : 'required'} |`)
      }
      lines.push('')
    }
  }

  lines.push('---')
  lines.push('')
  lines.push('## Actions')
  lines.push('')

  for (const name of catalog.actionNames) {
    const action = catalog.actions[name] as {
      description?: string
      params: z.ZodObject<z.ZodRawShape>
    }
    lines.push(`### ${name}`)
    lines.push('')
    if (action.description) {
      lines.push(action.description)
      lines.push('')
    }
    const shape = action.params.shape
    if (Object.keys(shape).length > 0) {
      lines.push('**Params:**')
      lines.push('')
      lines.push('| Param | Type |')
      lines.push('|-------|------|')
      for (const [paramName, paramSchema] of Object.entries(shape)) {
        lines.push(`| \`${paramName}\` | ${zodTypeToString(paramSchema as z.ZodTypeAny)} |`)
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

const prompt = buildPrompt()
writeFileSync('app/.claude/prompts/catalog-prompt.md', prompt)
console.log('Catalog prompt written to app/.claude/prompts/catalog-prompt.md')
