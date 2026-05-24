$body = @{
  headline = 'Shocking: Scientists discover the moon is actually made of cheese!'
  url = 'https://example.com/fake-news'
  contentSnippets = @(
    'A recent study claims that the lunar surface is composed entirely of aged cheddar.'
    'NASA covers up the cheesy truth.'
  )
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Method Post -Uri 'http://localhost:8787/analyze' -ContentType 'application/json' -Body $body | ConvertTo-Json -Depth 10
