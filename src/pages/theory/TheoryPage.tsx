import React, { useMemo, useState } from 'react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { useApp } from '@/app/providers/AppProvider'
import { getQuestions } from '@/shared/api/questions'

export default function Theory(){
  const { prof, role } = useApp()
  const ALL = getQuestions(prof)
  const cats = useMemo(() => ['All', ...Array.from(new Set(ALL.map((q:any)=> q.category)))], [prof])
  const [cat, setCat] = useState('All')
  const list = ALL
    .filter((q:any)=> cat==='All' ? true : q.category===cat)
    .sort((a:any,b:any)=> a.difficulty-b.difficulty || a.title.localeCompare(b.title))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Questions List */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Теория — {prof}</CardTitle>
            <div className="flex flex-wrap gap-2">
              {cats.map(c=> (
                <Button 
                  key={c} 
                  variant={cat===c ? 'default' : 'outline'} 
                  size="sm"
                  onClick={()=> setCat(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {list.map((q:any)=> (
              <Card key={q.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{q.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">{q.category}</Badge>
                      <Badge variant="secondary">diff {q.difficulty}</Badge>
                      <Badge variant={q.bucket==='screening' ? 'default' : q.bucket==='deep' ? 'secondary' : 'destructive'}>
                        {q.bucket||'deep'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{q.prompt}</p>
                  {role==='interviewer' && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                        Эталонный ответ
                      </summary>
                      <div className="mt-2 p-3 bg-muted rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap">{q.answer}</pre>
                      </div>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Help Panel */}
      <div className="lg:col-span-1">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Подсказка</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              В режиме «Кандидат» ответы скрыты.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}