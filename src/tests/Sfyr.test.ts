import { expect } from 'chai';
import { EPathToNodeRelation, Sfyr } from '../lib/stringifyr/Sfyr';

describe('Sfyr', () => {
  describe('splitResolvedPath', () => {
    it('should split a resolved path with HTML variable values', () => {
      const resolvedPath = '{locale=(en)}.blog.{title=<h1>Hello, world!</h1>}.{index=0}';
      const expected = ['{locale=(en)}', 'blog', '{title=<h1>Hello, world!</h1>}', '{index=0}'];
      const actual = Sfyr.splitResolvedPath(resolvedPath);
      expect(actual).to.eql(expected);
    });

    it('should split with partial variables', () => {
      expect(Sfyr.splitResolvedPath('{.blog')).to.eql(['{', 'blog']);
    });

    it('should split a resolved path with Markdown variable values', () => {
      const resolvedPath = '{locale=(en)}.blog.{content=*Hello*, **world!**}.{index=1}';
      const expected = ['{locale=(en)}', 'blog', '{content=*Hello*, **world!**}', '{index=1}'];
      const actual = Sfyr.splitResolvedPath(resolvedPath);
      expect(actual).to.eql(expected);
    });

    it('should split a resolved path with JSON variable values', () => {
      const resolvedPath = '{locale=(en)}.blog.{metadata={"title": "Hello", "author": "World"}}.{index=2}';
      const expected = ['{locale=(en)}', 'blog', '{metadata={"title": "Hello", "author": "World"}}', '{index=2}'];
      const actual = Sfyr.splitResolvedPath(resolvedPath);
      expect(actual).to.eql(expected);
    });

    it('should handle a resolved path with nested braces', () => {
      const resolvedPath = '{lo{ca{le}=(en)}}.bl{og}.{title={{{}<h1>Hello, world!</h1>}}}}.{index=0}';
      const expected = ['{lo{ca{le}=(en)}}', 'bl{og}', '{title={{{}<h1>Hello, world!</h1>}}}}', '{index=0}'];
      const actual = Sfyr.splitResolvedPath(resolvedPath);
      expect(actual).to.eql(expected);
    });

    it('should handle a resolved path with escaped braces', () => {
      const resolvedPath = '{locale=(en)}.blog.{title=\\{Hello, {world}!\\}}.{index=1}';
      const expected = ['{locale=(en)}', 'blog', '{title=\\{Hello, {world}!\\}}', '{index=1}'];
      const actual = Sfyr.splitResolvedPath(resolvedPath);
      expect(actual).to.eql(expected);
    });

    it('should handle a simple resolved path', () => {
      const resolvedPath = '{locale=(en)}.blog.{postIndex=1}.{pageIndex=2}';
      const expected = ['{locale=(en)}', 'blog', '{postIndex=1}', '{pageIndex=2}'];
      const actual = Sfyr.splitResolvedPath(resolvedPath);
      expect(actual).to.eql(expected);
    });

    it('should include empty if includeEmpty=true', () => {
      const resolvedPath = '{locale=it-IT}.blog.{postIndex=0}.';
      const expected = ['{locale=it-IT}', 'blog', '{postIndex=0}', ''];
      const actual = Sfyr.splitResolvedPath(resolvedPath);
      expect(actual).to.eql(expected);
    });

    it('should include empty in the middle if includeEmpty=true', () => {
      const resolvedPath = '{locale=it-IT}..{postIndex=0}.';
      const expected = ['{locale=it-IT}', '', '{postIndex=0}', ''];
      const actual = Sfyr.splitResolvedPath(resolvedPath);
      expect(actual).to.eql(expected);
    });
  });

  describe('variablesFromPathToNode', () => {
    it('handles a simple resolvedPath with two variables', () => {
      const resolvedPath = '{locale=en}.blog.{postIndex=1}';
      const variables = Sfyr.variablesFromPathToNode(resolvedPath);
      expect(variables).to.eql({
        locale: 'en',
        postIndex: '1',
      });
    });

    it('handles a resolvedPath with variable values containing dots and braces', () => {
      // eslint-disable-next-line
      const resolvedPath = '{variable1=(abc)}.{variable2=\{d\{e\}f\}}';
      const variables = Sfyr.variablesFromPathToNode(resolvedPath);
      expect(variables).to.eql({
        variable1: '(abc)',
        // eslint-disable-next-line
        variable2: '\{d\{e\}f\}',
      });
    });

    it('handles complex variables with escaped braces', () => {
      const resolvedPath = '{variable1=(a{{b}}c)}.{variable2=\\\\{\\\\}}.{variable3=(\\\\}}\\\\)}}';
      const variables = Sfyr.variablesFromPathToNode(resolvedPath);
      expect(variables).to.eql({
        variable1: '(a{{b}}c)',
        'variable2': '\\\\{\\\\}',
        'variable3': '(\\\\}}\\\\)}',
      });
    });
  });

  describe('selectGraphPath', () => {
    const node = {
      'blog': {
        'it': {
          'prototyping': {
            'content': 'blog about prototyping in italian',
            'slug': 'prototyping',
          },
        },
      },
    };

    it('selects correctly with all variables resolved', () => {
      const result = Sfyr.selectGraphPath({
        path: 'blog.{lang=it}.{slug=prototyping}',
        node,
      });

      expect(result).to.eql({
        'content': 'blog about prototyping in italian',
        'slug': 'prototyping',
      });
    });

    it('selects correctly with 1 variable resolved', () => {
      const result = Sfyr.selectGraphPath({
        path: 'blog.{lang=}.{slug=prototyping}',
        node,
      });

      expect(result).to.eql({
        'it': {
          'content': 'blog about prototyping in italian',
          'slug': 'prototyping',
        },
      });
    });

    it('selects correctly with no variables resolved', () => {
      const result = Sfyr.selectGraphPath({
        path: 'blog.{lang=}.{slug=}',
        node,
      });

      expect(result).to.eql({
        'it': {
          'prototyping': {
            'content': 'blog about prototyping in italian',
            'slug': 'prototyping',
          },
        },
      });
    });

    it('selects correctly with templates', () => {
      const result = Sfyr.selectGraphPath({
        path: 'blog.{lang}.{slug}',
        node,
      });

      expect(result).to.eql({
        'it': {
          'prototyping': {
            'content': 'blog about prototyping in italian',
            'slug': 'prototyping',
          },
        },
      });
    });

    it('selects correctly with template variables', () => {
      const result = Sfyr.selectGraphPath({
        path: 'pitch.{reason}',
        node: {
          "pitch": {
            "1": {
              "heading": {
                "type": "text",
                "value": "heading1"
              },
            },
            "2": {
              "heading": {
                "type": "text",
                "value": "heading2"
              },
            },
            "included": {
              "type": "text",
              "value": "included"
            },
          }
        },
      });

      expect(result).to.eql({
        "1": {
          "heading": {
            "type": "text",
            "value": "heading1"
          }
        },
        "2": {
          "heading": {
            "type": "text",
            "value": "heading2"
          }
        },
        "included": {
          "type": "text",
          "value": "included"
        }
      });
    });
  });

  describe('resolveFromPathToNode', () => {
    it('reduces correctly', () => {
      const result = Sfyr.resolveFromPathToNode({
        nodes: {
          "pitch": {
            "value": "excluded1"
          },
          "pitch.should_not_be_included": {
            "value": "excluded2"
          },
          "pitch.{reason=1}.heading": {
            "value": "heading1"
          },
          "pitch.{reason=2}.heading": {
            "value": "heading2"
          },
        },
        nodeToValue(node) {
          return node.value ?? null as string;
        }
      })

      expect(result).to.eql({
        "pitch": {
          "1": {
            "heading": {
              "value": "heading1"
            }
          },
          "2": {
            "heading": {
              "value": "heading2"
            }
          },
          "should_not_be_included": {
            "value": "excluded2"
          }
        }
      });
    })
  })

  describe('maybeJoinFirst', () => {
    it('joins correctly (simple)', () => {
      expect(Sfyr.maybeJoinFirst('.', 'blog')).to.eql('blog');
    });

    it('joins correctly (empty)', () => {
      expect(Sfyr.maybeJoinFirst('.')).to.eql('');
    });

    it('should return a string with join character between first two items', () => {
      const result = Sfyr.maybeJoinFirst(' ', 'Hello', 'world');
      expect(result).to.equal('Hello world');
    });

    it('should not add join character if first item is empty', () => {
      const result = Sfyr.maybeJoinFirst(' ', '', 'world');
      expect(result).to.equal('world');
    });

    it('should ignore empty next arguments', () => {
      const result = Sfyr.maybeJoinFirst(' ', '', '', '');
      expect(result).to.equal(' ');
    });

    it('should not add join character if only one item is provided', () => {
      const result = Sfyr.maybeJoinFirst(' ', 'Hello');
      expect(result).to.equal('Hello');
    });

    it('should return empty string if no items are provided', () => {
      const result = Sfyr.maybeJoinFirst(' ');
      expect(result).to.equal('');
    });

    it('should join all items with join character', () => {
      const result = Sfyr.maybeJoinFirst('-', 'Hello', 'world', 'test');
      expect(result).to.equal('Hello-world-test');
    });
  });

  describe('comparePathToNode', () => {
    it('identifies shadow correctly', () => {
      // 1 is a shadow of 2 because they differ only by variables in the same indexes
      expect(Sfyr.comparePathToNode(
        'a.{var=1}.b.c',
        'a.{var=10}.b.c',
      )).to.eql(EPathToNodeRelation.shadow);
    });

    it('identifies sibling correctly', () => {
      // 1 is a sibling of 2 because they differ only by their leaf
      expect(Sfyr.comparePathToNode(
        'a.{var=1}.b.c',
        'a.{var=1}.b.x',
      )).to.eql(EPathToNodeRelation.sibling);
    });

    it('identifies sibling correctly', () => {
      // 1 is a sibling of 2 because they differ only by their leaf
      expect(Sfyr.comparePathToNode(
        'a',
        'b',
      )).to.eql(EPathToNodeRelation.sibling);
    });

    it('identifies self correctly 1', () => {
      expect(Sfyr.comparePathToNode(
        '',
        '',
      )).to.eql(EPathToNodeRelation.self);
    });

    it('identifies parent correctly', () => {
      // 1 is a parent of 2 because 1 prefixes 2
      expect(Sfyr.comparePathToNode(
        'a.{var=1}',
        'a.{var=1}.b.x',
      )).to.eql(EPathToNodeRelation.parent);
    });

    it('does not confuse parents with shadows', () => {
      // 1 is a parent of 2 because 1 prefixes 2
      expect(Sfyr.comparePathToNode(
        'a.{var=1}',
        'a.{var=10}.b.x',
      )).to.not.eql(EPathToNodeRelation.parent);
    });

    it('does not confuse children with shadows', () => {
      // 1 is a parent of 2 because 1 prefixes 2
      expect(Sfyr.comparePathToNode(
        'a.{var=10}.b.x',
        'a.{var=1}',
      )).to.not.eql(EPathToNodeRelation.child);
    });

    it('identifies child correctly', () => {
      // 1 is a child of 2 because 2 prefixes 1
      expect(Sfyr.comparePathToNode(
        'a.{var=1}.b.x',
        'a.{var=1}',
      )).to.eql(EPathToNodeRelation.child);
    });

    it('identifies unrelated correctly', () => {
      // 1 is unrelated to 2 because no other condition is matched
      expect(Sfyr.comparePathToNode(
        'a.{var=10}.b.x',
        'a.{otherVar=00}.b.x',
      )).to.eql(EPathToNodeRelation.unrelated);
    });

    it('identifies parentShadow correctly', () => {
      // 1 is a parentShadow of 2 because 1's template is a parent of 2's template
      // and they are shadows
      expect(Sfyr.comparePathToNode(
        'blog.{lang=en}.something',
        'blog.{lang=it}.something.next',
      )).to.eql(EPathToNodeRelation.parentShadow);
    });
  });

  describe('reduceGraphNode', () => {
    it('reduces correctly 1', () => {
      const result = Sfyr.reduceGraphNode({
        nodes: [
          {
            'segmentPath': 'blog',
            'children': [
              {
                'segmentPath': '{lang=it}',
                'children': [
                  {
                    'segmentPath': '{id=prototyping}',
                    'children': [
                      {
                        'segmentPath': 'content',
                        'children': [],
                        'value': 'blog about prototyping in italian',
                      },
                      {
                        'segmentPath': 'slug',
                        'children': [],
                        'value': 'prototyping',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        nodeToSegment: (t) => t.segmentPath,
        nodeToChildren: (t) => t.children,
        nodeToValue: (t: any) => t.value ?? '',
      });

      expect(result).to.eql({
        'blog': {
          'it': {
            'prototyping': {
              'content': 'blog about prototyping in italian',
              'slug': 'prototyping',
            },
          },
        },
      });
    });
  });

  describe('makeInternalGraphNode', () => {
    it('makeInternalGraphNode 1', () => {
      const result = Sfyr.makeInternalGraphNode('{locale=en-US}.file.{content=<div>ok<b>bold{(}</b></div>ok}', {
        a: 1,
      });
      expect(result).to.eql({
        segmentPath: '{locale=en-US}',
        "inferredFrom": "{locale=en-US}.file.{content=<div>ok<b>bold{(}</b></div>ok}",
        children: [
          {
            segmentPath: 'file',
            "inferredFrom": "file.{content=<div>ok<b>bold{(}</b></div>ok}",
            children: [
              {
                "inferredFrom": "{content=<div>ok<b>bold{(}</b></div>ok}",
                segmentPath: '{content=<div>ok<b>bold{(}</b></div>ok}',
                value: { a: 1 },
                children: [],
              },
            ],
          },
        ],
      });
    });

    it('makeInternalGraphNode correctly creates a tree node for a resolvedPath with multiple segments', () => {
      const resolvedPath = '{locale=(en)}.blog.{postIndex=1}.comments.{commentIndex=2}';
      const value = { text: 'Some comment text' };
      const node = Sfyr.makeInternalGraphNode(resolvedPath, value);
      expect(node).to.eql({
        segmentPath: '{locale=(en)}',
        "inferredFrom": "{locale=(en)}.blog.{postIndex=1}.comments.{commentIndex=2}",
        children: [
          {
            segmentPath: 'blog',
            "inferredFrom": "blog.{postIndex=1}.comments.{commentIndex=2}",
            children: [
              {
                segmentPath: '{postIndex=1}',
                "inferredFrom": "{postIndex=1}.comments.{commentIndex=2}",
                children: [
                  {
                    segmentPath: 'comments',
                    "inferredFrom": "comments.{commentIndex=2}",
                    children: [
                      {
                        "inferredFrom": "{commentIndex=2}",
                        segmentPath: '{commentIndex=2}',
                        value: { text: 'Some comment text' },
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });
    });
  });

  describe('mergeInternalGraphNodes', () => {
    it('should work with different root nodes', () => {
      const nodeA = Sfyr.makeInternalGraphNode('{locale=en-US}.title', 'my title');
      const nodeB = Sfyr.makeInternalGraphNode('{locale=it-IT}.title', 'my italian title');

      const merged = Sfyr.mergeInternalGraphNodes(nodeA, nodeB);

      expect(merged).to.eql([
        nodeA,
        nodeB,
      ]);
    });

    it('should work with same root nodes', () => {
      const nodeA = Sfyr.makeInternalGraphNode('{locale=en-US}.title', 'my title');
      const nodeB = Sfyr.makeInternalGraphNode('{locale=en-US}.subtitle', 'my subtitle');

      const merged = Sfyr.mergeInternalGraphNodes(nodeA, nodeB);

      expect(merged).to.eql([
        {
          segmentPath: '{locale=en-US}',
          "inferredFrom": "{locale=en-US}.title",
          children: [
            {
              'children': [],
              segmentPath: 'title',
              "inferredFrom": "title",
              value: 'my title',
            },
            {
              'children': [],
              segmentPath: 'subtitle',
              "inferredFrom": "subtitle",
              value: 'my subtitle',
            },
          ],
        },
      ]);
    });

    it('should not consider an empty string to be a parent of all', () => {
      const nodeA = Sfyr.makeInternalGraphNode('', 'my title');
      const nodeB = Sfyr.makeInternalGraphNode('subtitle.a', 'my subtitle');

      const merged = Sfyr.mergeInternalGraphNodes(nodeA, nodeB);

      expect(merged).to.eql([
        {
          "segmentPath": "",
          "inferredFrom": "",
          "children": [],
          "value": "my title"
        },
        {
          "segmentPath": "subtitle",
          "inferredFrom": "subtitle.a",
          "children": [
            {
              "segmentPath": "a",
              "inferredFrom": "a",
              "children": [],
              "value": "my subtitle"
            }
          ]
        }
      ]);
    });
  });

  describe('updatePathToNode', () => {
    it('calculates leaf segment updates correctly', () => {
      const result = Sfyr.updatePathToNode(
        'blog.{lang=en}.old',
        'blog.{lang=en}.new',
        [
          'blog.{lang=it}.old',
          'blog.{lang=it}.unrelated',
          'blog.{lang=en}.old',
          'blog.{lang=en}.unrelated',
        ],
      );

      expect(result).to.eql([
        'blog.{lang=it}.new', // This get's updated because it has the same template root blog.new
        null, // 'blog.{lang=it}.unrelated', Not updated because different template root blog.{lang}.unrelated
        'blog.{lang=en}.new', // This get's updated because it has the same template root blog.{lang}.new
        null, // 'blog.{lang=en}.unrelated', Not updated because different template root blog.{lang}.unrelated
      ]);
    });

    it('calculates leaf segment variable updates correctly', () => {
      const result = Sfyr.updatePathToNode(
        'blog.{lang=en}.old',
        'blog.{lang=en}.{var=1}',
        [
          'blog.{lang=it}.old',
          'blog.{lang=it}.unrelated',
          'blog.{lang=en}.old',
          'blog.{lang=en}.unrelated',
        ],
      );

      expect(result).to.eql([
        'blog.{lang=it}.{var=1}', // This get's updated because it has the same template root
        null, // 'blog.{lang=it}.unrelated', Not updated because different template root
        'blog.{lang=en}.{var=1}', // This get's updated because it has the same template root
        null, // 'blog.{lang=en}.unrelated', Not updated because different template root
      ]);
    });

    it('calculates branch segment updates correctly', () => {
      const result = Sfyr.updatePathToNode(
        'blog.{lang=en}',
        'blog.{lang=ko}',
        [
          'blog.{lang=it}.{other=1}.old',
          'blog.{lang=it}.{other=1}.unrelated',
          'blog.{lang=en}.{other=1}.old',
          'blog.{lang=en}.{other=2}.unrelated',
        ],
      );

      expect(result).to.eql([
        null,
        null,
        'blog.{lang=ko}.{other=1}.old',
        'blog.{lang=ko}.{other=2}.unrelated',
      ]);
    });

    it('calculates branch segment updates correctly 2', () => {
      const result = Sfyr.updatePathToNode(
        'blog.{lang=en}',
        'blog.{lang=zh}',
        [
          'blog.{lang=it}',
        ],
      );

      expect(result).to.eql([
        null,
      ]);
    });

    it('calculates branch segment variable updates correctly', () => {
      const result = Sfyr.updatePathToNode(
        'blog.{lang=en}.something',
        'blog.{lang=en}.{introduceAVar=1}',
        [
          'unrelated.blog.{lang=it}.something.next',
          'blog.{lang=it}.something.next',
          'blog.{lang=it}.unrelated',
          'blog.{lang=it}.something',
          'blog.{lang=it}.something.{other=1}',
          'blog.{lang=en}.something.next',
          'blog.{lang=en}.unrelated',
          'blog.{lang=en}.something',
          'blog.{lang=en}.something.{other=1}',
        ],
      );

      expect(result).to.eql([
        null, // 'unrelated.blog.{lang=it}.something.next',
        'blog.{lang=it}.{introduceAVar=1}.next',
        null, // 'blog.{lang=it}.unrelated',
        'blog.{lang=it}.{introduceAVar=1}',
        'blog.{lang=it}.{introduceAVar=1}.{other=1}',
        'blog.{lang=en}.{introduceAVar=1}.next',
        null, // 'blog.{lang=en}.unrelated',
        'blog.{lang=en}.{introduceAVar=1}',
        'blog.{lang=en}.{introduceAVar=1}.{other=1}',
      ]);
    });
  });
});
