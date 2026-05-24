onRecordUpdate((e) => {
  const oldStatus = e.record.original().get('status')
  const newStatus = e.record.get('status')

  if (newStatus === 'pending_review' && oldStatus !== 'pending_review') {
    const col = $app.findCollectionByNameOrId('audit_log')
    const log = new Record(col)
    log.set('record_id', e.record.id)
    log.set('collection', 'posts')
    log.set('change', `status changed to pending_review from ${oldStatus}`)
    $app.save(log)
  }

  return e.next()
}, 'posts')
