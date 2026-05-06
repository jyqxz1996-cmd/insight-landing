// Pages Function: /api/submit
// 处理落地页表单提交，存储到KV

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const data = await request.json();
    const { chaos, contact } = data;

    if (!chaos || !contact) {
      return new Response(JSON.stringify({ error: 'chaos和contact字段必填' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const submission = {
      id,
      chaos: chaos.substring(0, 5000),
      contact: contact.substring(0, 200),
      timestamp,
      status: 'pending',
    };

    // 存储到KV
    await env.INSIGHT_KV.put(`sub:${id}`, JSON.stringify(submission));

    // 维护日期索引
    const today = timestamp.split('T')[0];
    const indexKey = `idx:${today}`;
    const existingIndex = await env.INSIGHT_KV.get(indexKey);
    const index = existingIndex ? JSON.parse(existingIndex) : [];
    index.push(id);
    await env.INSIGHT_KV.put(indexKey, JSON.stringify(index));

    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
