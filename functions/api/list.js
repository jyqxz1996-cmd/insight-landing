// Pages Function: /api/list
// 查看某天的提交列表（管理用）

export async function onRequestGet(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

    const indexKey = `idx:${date}`;
    const indexData = await env.INSIGHT_KV.get(indexKey);

    if (!indexData) {
      return new Response(JSON.stringify({ date, submissions: [] }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const ids = JSON.parse(indexData);
    const submissions = [];

    for (const id of ids) {
      const data = await env.INSIGHT_KV.get(`sub:${id}`);
      if (data) submissions.push(JSON.parse(data));
    }

    return new Response(JSON.stringify({ date, count: submissions.length, submissions }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
