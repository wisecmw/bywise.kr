item.querySelector("button").onclick = async () => {

  if (!confirm(`"${p.title}" 프로젝트를 삭제할까요?`)) return;

  const deletedOrder = Number(p.sort_order || 0);

  const { error: delError } = await supabase
    .from("projects")
    .delete()
    .eq("id", p.id);

  if (delError) {
    alert(delError.message);
    return;
  }

  if (p.storage_path) {
    await supabase.storage
      .from("thumbnails")
      .remove([p.storage_path]);
  }

  // 삭제된 ORDER보다 뒤에 있는 프로젝트 불러오기
  const { data: laterProjects, error: orderError } = await supabase
    .from("projects")
    .select("id, sort_order")
    .gt("sort_order", deletedOrder)
    .order("sort_order", { ascending: true });

  if (orderError) {
    alert(orderError.message);
    loadList();
    return;
  }

  // 뒤 프로젝트들을 한 칸씩 앞으로 이동
  for (const project of laterProjects || []) {

    const currentOrder = Number(project.sort_order || 0);

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        sort_order: currentOrder - 1
      })
      .eq("id", project.id);

    if (updateError) {
      alert(updateError.message);
      break;
    }
  }

  loadList();
};
