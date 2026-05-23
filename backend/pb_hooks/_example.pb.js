// Example: log an audit event when a record's status changes
//
// Hook files in backend/pb_hooks/ are loaded automatically by PocketBase on startup.
// Changes to hook files require a PocketBase restart to take effect.
//
// For your own hooks, create files in app/hooks/ named <name>.pb.js and run
// 'pnpm setup' — they are copied here automatically.

onRecordUpdate((e) => {
  const oldStatus = e.record.original().get('status')
  const newStatus = e.record.get('status')

  if (oldStatus !== newStatus) {
    // Create an audit_log record
    const collection = $app.findCollectionByNameOrId('audit_log')
    const log = new Record(collection)
    log.set('record_id', e.record.id)
    log.set('collection', e.record.collection().name)
    log.set('change', `status: ${oldStatus} → ${newStatus}`)
    $app.save(log)
  }

  return e.next()
}, 'posts') // second arg scopes hook to the 'posts' collection
