package com.example.goweb_spring;

import com.example.goweb_spring.proto.HelloReply;
import com.example.goweb_spring.proto.HelloRequest;
import com.example.goweb_spring.proto.SimpleGrpc;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication(exclude = {
		net.devh.boot.grpc.server.autoconfigure.GrpcServerSecurityAutoConfiguration.class
})
public class GowebSpringApplication {

	public static void main(String[] args) {
		SpringApplication.run(GowebSpringApplication.class, args);
	}

}


@GrpcService
class HelloWorldService extends SimpleGrpc.SimpleImplBase  {
	@Override
	public void sayHello(HelloRequest request, StreamObserver<HelloReply> responseObserver) {
		HelloReply reply = HelloReply.newBuilder().setMessage("hello" + request.getName()).build();
		responseObserver.onNext(reply);
		responseObserver.onCompleted();
	}
}