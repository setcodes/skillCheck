import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/ui/card';
import { useApp } from '@/app/providers/AppProvider';
import { getQuestions } from '@/shared/api/questions';
import { useToast } from '@/shared/hooks/use-toast';
import { Send, CheckCircle } from 'lucide-react';

export default function Theory() {
	const { prof, role } = useApp();
	const { toast } = useToast();
	const ALL = getQuestions(prof);
	const cats = useMemo(
		() => ['All', ...Array.from(new Set(ALL.map((q: any) => q.category)))],
		[prof]
	);
	const [cat, setCat] = useState('All');
	const list = ALL.filter((q: any) =>
		cat === 'All' ? true : q.category === cat
	).sort(
		(a: any, b: any) =>
			a.difficulty - b.difficulty || a.title.localeCompare(b.title)
	);

	// Right panel: select question and evaluate
	const [curQ, setCurQ] = useState<string>(ALL[0]?.id || '');
	useEffect(() => {
		setCurQ(ALL[0]?.id || '');
	}, [prof]);
	const cur = useMemo(() => ALL.find((q: any) => q.id === curQ), [ALL, curQ]);

	// Draft per-question evaluation (persisted locally)
	type Draft = { score?: number; comment?: string };
	const DK = `theory.drafts.v1.${prof}`;
	const loadDrafts = (): Record<string, Draft> => {
		try {
			const r = localStorage.getItem(DK);
			if (r) return JSON.parse(r);
		} catch {}
		return {};
	};
	const [drafts, setDrafts] = useState<Record<string, Draft>>(loadDrafts());
	useEffect(() => {
		try {
			localStorage.setItem(DK, JSON.stringify(drafts));
		} catch {}
	}, [drafts, DK]);
	const setScore = (s: number) =>
		cur &&
		setDrafts((a) => ({ ...a, [cur.id]: { ...(a[cur.id] || {}), score: s } }));
	const setComment = (c: string) =>
		cur &&
		setDrafts((a) => ({
			...a,
			[cur.id]: { ...(a[cur.id] || {}), comment: c },
		}));
	const push = () => {
		if (!cur) return;
		const payload = {
			prof,
			questionId: cur.id,
			title: cur.title,
			category: cur.category,
			difficulty: cur.difficulty,
			score: drafts[cur.id]?.score ?? 0,
			comment: drafts[cur.id]?.comment || '',
		};
		const key = 'bridge.theoryScores.v1';
		const bridge = JSON.parse(localStorage.getItem(key) || '{}') as Record<
			string,
			any
		>;
		bridge[prof + ':' + cur.id] = payload;
		localStorage.setItem(key, JSON.stringify(bridge));
		toast({
			title: (
				<span className="inline-flex items-center gap-2">
					<CheckCircle className="h-4 w-4 text-green-600" />
					Оценка сохранена
				</span>
			),
			description: 'Оценка по теории добавлена в отчёт.',
		});
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
			{/* Questions List */}
			<div className="lg:col-span-2 h-full min-h-0">
				<Card className="h-full flex flex-col">
					<CardHeader>
						<CardTitle>Теория — {prof}</CardTitle>
						<div className="flex flex-wrap gap-2">
							{cats.map((c) => (
								<Button
									key={c}
									variant={cat === c ? 'default' : 'outline'}
									size="sm"
									onClick={() => setCat(c)}
								>
									{c}
								</Button>
							))}
						</div>
					</CardHeader>
					<CardContent className="flex-1 overflow-hidden">
						<div className="h-full overflow-y-auto space-y-4 pr-1">
							{list.map((q: any) => (
								<Card
									key={q.id}
									className={`${cur?.id === q.id ? 'border-primary ring-1 ring-primary' : ''} cursor-pointer transition-colors`}
									onClick={() => setCurQ(q.id)}
								>
									<CardHeader>
										<div className="flex items-center justify-between">
											<CardTitle className="text-lg">{q.title}</CardTitle>
											<div className="flex gap-2">
												<Badge variant="outline">{q.category}</Badge>
												<Badge variant="secondary">diff {q.difficulty}</Badge>
												<Badge
													variant={
														q.bucket === 'screening'
															? 'default'
															: q.bucket === 'deep'
																? 'secondary'
																: 'destructive'
													}
												>
													{q.bucket || 'deep'}
												</Badge>
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<p className="text-sm text-muted-foreground mb-4">
											{q.prompt}
										</p>
										{/* Эталонный ответ убран из списка. Доступен в правой подсказке. */}
									</CardContent>
								</Card>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Right Panel: Evaluation + Hint */}
			<div className="lg:col-span-1 space-y-4">
				{/* Evaluation block */}
				<Card className="h-fit">
					<CardHeader>
						<CardTitle>Оценка</CardTitle>
						<CardDescription>
							Выберите вопрос слева, затем выставьте оценку и комментарий.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="space-y-1">
							<label className="text-sm font-medium">Текущий вопрос:</label>
							<div className="text-sm">
								{cur ? (
									<>
										<div className="font-medium">{cur.title}</div>
										<div className="text-muted-foreground">
											{cur.category} • сложность {cur.difficulty}
										</div>
									</>
								) : (
									<span className="text-muted-foreground">
										Выберите вопрос из списка слева
									</span>
								)}
							</div>
						</div>
						{role === 'interviewer' ? (
							<>
								<div className="flex items-center gap-2">
									<label className="text-sm">Оценка (0–5):</label>
									<Input
										type="number"
										min={0}
										max={5}
										step={0.5}
										className="w-24"
										value={cur ? (drafts[cur.id]?.score ?? '') : ''}
										onChange={(e) => setScore(Number(e.target.value))}
										disabled={!cur}
									/>
								</div>
								<div className="space-y-1">
									<label className="text-sm">Комментарий:</label>
									<Textarea
										placeholder="Краткая обратная связь"
										value={cur ? drafts[cur.id]?.comment || '' : ''}
										onChange={(e) => setComment(e.target.value)}
										disabled={!cur}
									/>
								</div>
								<div>
									<Button
										variant="outline"
										onClick={push}
										disabled={!cur}
										className="inline-flex items-center gap-2"
									>
										<Send className="h-4 w-4" />
										Отправить оценку
									</Button>
								</div>
							</>
						) : (
							<p className="text-sm text-muted-foreground">
								Оценка доступна только интервьюеру
							</p>
						)}
					</CardContent>
				</Card>

				{/* Hint block */}
				<Card className="h-fit">
					<CardHeader>
						<CardTitle>Подсказка</CardTitle>
						{cur && <CardDescription>{cur.title}</CardDescription>}
					</CardHeader>
					<CardContent>
						{cur && role === 'interviewer' ? (
							<div className="mt-1 p-3 bg-muted rounded-lg">
								<pre className="text-sm whitespace-pre-wrap">{cur.answer}</pre>
							</div>
						) : (
							<p className="text-sm text-muted-foreground">
								В режиме «Кандидат» ответы скрыты.
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
