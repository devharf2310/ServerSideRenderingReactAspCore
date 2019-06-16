﻿class CommentBox extends React.Component {
	state = { data: this.props.initialData };

	loadCommentsFromServer = () => {
		var xhr = new XMLHttpRequest();
		xhr.open('get', this.props.url, true);
		xhr.onload = function() {
			var data = JSON.parse(xhr.responseText);
			this.setState({ data: data });
		}.bind(this);
		xhr.send();
	};

	handleCommentSubmit = comment => {
		var comments = this.state.data;
		// Optimistically set an id on the new comment. It will be replaced by an
		// id generated by the server. In a production application you would likely
		// not use Date.now() for this and would have a more robust system in place.
		comment.id = Date.now();
		var newComments = comments.concat([comment]);
		this.setState({ data: newComments });

		var data = new FormData();
		data.append('author', comment.author);
		data.append('text', comment.text);

		var xhr = new XMLHttpRequest();
		xhr.open('post', this.props.submitUrl, true);
		xhr.onload = function() {
			this.loadCommentsFromServer();
		}.bind(this);
		xhr.send(data);
	};

	componentDidMount() {
		window.setInterval(this.loadCommentsFromServer, this.props.pollInterval);
	}

	render() {
		return (
			<div className="commentBox">
				<h1>Comments</h1>
				<CommentList data={this.state.data} />
				<CommentForm onCommentSubmit={this.handleCommentSubmit} />
			</div>
		);
	}
}

class CommentList extends React.Component {
	render() {
		var commentNodes = this.props.data.map(function(comment) {
			return (
				<Comment author={comment.author} key={comment.id}>
					{comment.text}
				</Comment>
			);
		});
		return <div className="commentList">{commentNodes}</div>;
	}
}

class CommentForm extends React.Component {
	state = {
		author: '',
		text: ''
	};

	handleAuthorChange = e => {
		this.setState({ author: e.target.value });
	};

	handleTextChange = e => {
		this.setState({ text: e.target.value });
	};

	handleSubmit = e => {
		e.preventDefault();
		var author = this.state.author.trim();
		var text = this.state.text.trim();
		if (!text || !author) {
			return;
		}
		this.props.onCommentSubmit({ author: author, text: text });
		this.setState({ author: '', text: '' });
	};

	render() {
		return (
			<form className="commentForm" onSubmit={this.handleSubmit}>
				<input
					type="text"
					placeholder="Your name"
					value={this.state.author}
					onChange={this.handleAuthorChange}
				/>
				<input
					type="text"
					placeholder="Say something..."
					value={this.state.text}
					onChange={this.handleTextChange}
				/>
				<input type="submit" value="Post" />
			</form>
		);
	}
}

function createRemarkable() {
	var remarkable =
		'undefined' != typeof global && global.Remarkable
			? global.Remarkable
			: window.Remarkable;

	return new remarkable();
}

class Comment extends React.Component {
	rawMarkup = () => {
		var md = createRemarkable();
		var rawMarkup = md.render(this.props.children.toString());
		return { __html: rawMarkup };
	};

	render() {
		return (
			<div className="comment">
				<h2 className="commentAuthor">{this.props.author}</h2>
				<span dangerouslySetInnerHTML={this.rawMarkup()} />
			</div>
		);
	}
}