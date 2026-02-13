const Inline = Quill.import('blots/inline');

class CommentBlot extends Inline {
  static create(value) {
    const node = super.create();
    // value will be the unique ID for this comment
    node.setAttribute('data-id', value);
    node.setAttribute('class', 'ql-comment');
    return node;
  }

  static formats(node) {
    return node.getAttribute('data-id');
  }
}

CommentBlot.blotName = 'comment';
CommentBlot.tagName = 'span';
Quill.register(CommentBlot);