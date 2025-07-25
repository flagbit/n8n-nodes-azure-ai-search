# Azure AI Search Filter Examples
## Using Custom OData Filter Expressions

With the enhanced Azure AI Search node, you can now use custom OData filter expressions directly instead of being limited to metadata key-value pairs.

### Example Filter Expressions

#### 1. Filter by metadata source
```odata
metadata/source eq 'document.pdf'
```

#### 2. Filter by attributes (key-value metadata)
```odata
metadata/attributes/any(attr: attr/key eq 'category' and attr/value eq 'technology')
```

#### 3. Multiple attribute filters
```odata
metadata/attributes/any(attr: attr/key eq 'category' and attr/value eq 'technology') and metadata/attributes/any(attr: attr/key eq 'language' and attr/value eq 'en')
```

#### 4. Complex filters with OR conditions
```odata
metadata/source eq 'document.pdf' or metadata/attributes/any(attr: attr/key eq 'category' and attr/value eq 'urgent')
```

#### 5. Numeric comparisons (if using numeric fields)
```odata
metadata/attributes/any(attr: attr/key eq 'rating' and attr/value gt '4')
```

### How to Use

1. **Custom OData Filter (Method 1):**
   - Set "Filter Mode" to "Custom OData Filter"
   - Enter your custom filter expression in the "Custom Filter Expression" field

2. **Metadata Fields with Auto-Detection (Method 2):**
   - Set "Filter Mode" to "Metadata Fields"
   - Add a single key-value pair where the value contains your complete OData filter
   - Example: Key=`filter`, Value=`metadata/source eq 'document.pdf' and metadata/attributes/any(attr: attr/key eq 'category' and attr/value eq 'technology')`
   - The system will automatically detect OData syntax and use the value directly

3. **Traditional Metadata Fields (Method 3):**
   - Set "Filter Mode" to "Metadata Fields"
   - Add multiple key-value pairs for simple filtering
   - These will be automatically converted to OData format

### Auto-Detection of OData Expressions

When using "Metadata Fields" mode, the system automatically detects if a value contains OData syntax by looking for:
- Keywords: `eq`, `ne`, `lt`, `gt`, `and`, `or`, `any`, `all`
- Path separators: `/`
- Field references: `metadata/`

If detected, the entire value is used as the filter expression directly.

**Example:**
- Key: `customFilter`
- Value: `metadata/source eq 'important.pdf' or metadata/attributes/any(attr: attr/key eq 'priority' and attr/value eq 'high')`

### Complete Example Scenarios

#### Scenario 1: Using Custom OData Filter Mode
```
Filter Mode: "Custom OData Filter"
Custom Filter Expression: "metadata/attributes/any(attr: attr/key eq 'department' and attr/value eq 'engineering') and metadata/source ne 'draft.pdf'"
```

#### Scenario 2: Using Metadata Fields with Single Filter Value
```
Filter Mode: "Metadata Fields"
Key: "odata_filter"
Value: "metadata/attributes/any(attr: attr/key eq 'category' and attr/value eq 'urgent') or metadata/attributes/any(attr: attr/key eq 'status' and attr/value eq 'active')"
```

#### Scenario 3: Using Traditional Metadata Fields
```
Filter Mode: "Metadata Fields"
Key 1: "category" | Value 1: "technology"
Key 2: "language" | Value 2: "en"
(Automatically converted to: metadata/attributes/any(attr: attr/key eq 'category' and attr/value eq 'technology') and metadata/attributes/any(attr: attr/key eq 'language' and attr/value eq 'en'))
```

### OData Syntax Notes

- String values must be enclosed in single quotes: `'value'`
- To include a single quote in a string, escape it by doubling: `'Don''t'`
- Use `eq` for equality, `ne` for not equal, `lt`/`gt` for less/greater than
- Use `and`/`or` for logical operations
- Use `any()` for collection fields like attributes

### Azure AI Search Field Structure

The Azure AI Search index has this metadata structure:
```json
{
  "metadata": {
    "source": "string",
    "attributes": [
      {"key": "category", "value": "technology"},
      {"key": "language", "value": "en"}
    ]
  }
}
```

This allows you to filter on both the `source` field directly and on any key-value pairs in the `attributes` collection.
