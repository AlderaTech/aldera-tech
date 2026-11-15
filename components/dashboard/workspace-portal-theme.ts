type ThemeTarget = Pick<
  HTMLElement,
  "getAttribute" | "setAttribute" | "removeAttribute"
> & {
  classList: Pick<DOMTokenList, "contains" | "add" | "remove">;
};
type ClassOwner = { count: number; existed: boolean };
type AttributeOwner = { count: number; previous: string | null };
const owners = new WeakMap<ThemeTarget, Map<string, ClassOwner>>();
const attributes = new WeakMap<ThemeTarget, Map<string, AttributeOwner>>();

/** Keep portal styling until the last workspace using each class unmounts. */
export function mountWorkspacePortalTheme(
  target: ThemeTarget,
  classes: readonly string[],
  attribute: string
) {
  const registry = owners.get(target) ?? new Map<string, ClassOwner>();
  owners.set(target, registry);
  const attributeRegistry =
    attributes.get(target) ?? new Map<string, AttributeOwner>();
  attributes.set(target, attributeRegistry);
  const attributeOwner = attributeRegistry.get(attribute) ?? {
    count: 0,
    previous: target.getAttribute(attribute),
  };
  attributeOwner.count += 1;
  attributeRegistry.set(attribute, attributeOwner);
  target.setAttribute(attribute, "true");
  for (const name of classes) {
    const owner = registry.get(name) ?? {
      count: 0,
      existed: target.classList.contains(name),
    };
    owner.count += 1;
    registry.set(name, owner);
    target.classList.add(name);
  }
  return () => {
    attributeOwner.count -= 1;
    if (attributeOwner.count === 0) {
      if (attributeOwner.previous === null) target.removeAttribute(attribute);
      else target.setAttribute(attribute, attributeOwner.previous);
      attributeRegistry.delete(attribute);
    }
    if (attributeRegistry.size === 0) attributes.delete(target);
    for (const name of classes) {
      const owner = registry.get(name);
      if (!owner) continue;
      owner.count -= 1;
      if (owner.count === 0) {
        if (!owner.existed) target.classList.remove(name);
        registry.delete(name);
      }
    }
    if (registry.size === 0) owners.delete(target);
  };
}
